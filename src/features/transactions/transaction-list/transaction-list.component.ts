import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz, CellValueChangedEvent, CellClickedEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction } from '../../../models/transaction.model';
import { TransactionService } from '../../../services/transaction.service';
import { AmountCellRendererComponent } from './cell-renderers/amount-cell-renderer.component';
import { ActionsCellRendererComponent } from './cell-renderers/actions-cell-renderer.component';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
    
ModuleRegistry.registerModules([ AllCommunityModule ]);

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, AgGridAngular],
  templateUrl: './transaction-list.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TransactionListComponent implements OnInit {
  transactions$: Observable<Transaction[]>;
  summary$: Observable<{ totalTransactions: number, totalCredits: number, totalDebits: number, balance: number }>;
  deviceTheme: string = 'dark-mode';
  theme = themeQuartz
	.withParams({
    backgroundColor: "#1f2836",
    browserColorScheme: "dark",
    chromeBackgroundColor: {
        ref: "foregroundColor",
        mix: 0.07,
        onto: "backgroundColor"
    },
    foregroundColor: "#fff",
    headerFontSize: 14
  }, 'dark-mode')
  .withParams({
    browserColorScheme: "light",
    headerFontSize: 14
  }, 'light-mode');

  private gridApi!: GridApi;
  rowClassRules = {
    'bg-red-600/10': (params: any) => {
      return Math.abs(params.data?.amount) > 10000;
    },
  };

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'Transaction ID', filter: true, sortable: true, flex: 1, editable: false },
    { field: 'date', headerName: 'Date', filter: true, sortable: true, flex: 1.5, editable: false },
    { 
      field: 'description', 
      headerName: 'Description', 
      filter: true, 
      sortable: true, 
      flex: 3,
      editable: true
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      filter: 'agNumberColumnFilter', 
      sortable: true, 
      cellRenderer: AmountCellRendererComponent,
      flex: 1.5,
      headerClass: 'ag-right-aligned-header',
      cellStyle: { textAlign: 'right' },
      editable: true,
      valueParser: (params) => {
        const newValue = parseFloat(params.newValue);
        return isNaN(newValue) ? params.oldValue : newValue;
      }
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      filter: true, 
      sortable: true, 
      flex: 1,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Credit', 'Debit']
      }
    },
    { field: 'accountNumber', headerName: 'Account Number', filter: true, sortable: true, flex: 2, editable: false },
    {
      headerName: 'Delete',
      cellRenderer: ActionsCellRendererComponent,
      sortable: false,
      filter: false,
      width: 80,
      cellStyle: { padding: 0 },
      cellRendererParams: {
        componentParent: this
      }
    }
  ];

  defaultColDef: ColDef = {
    resizable: true,
    editable: false,
  };

  constructor(private transactionService: TransactionService, private router: Router, private cdr: ChangeDetectorRef) {
    this.transactions$ = this.transactionService.getTransactions();
    this.summary$ = this.transactions$.pipe(
      map(transactions => {
        const totalCredits = transactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0);
        const totalDebits = transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0);
        return {
          totalTransactions: transactions.length,
          totalCredits: totalCredits,
          totalDebits: Math.abs(totalDebits),
          balance: totalCredits + totalDebits
        };
      })
    );
  }

  ngOnInit(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.deviceTheme = prefersDark.matches ? 'dark-mode' : 'light-mode';

    prefersDark.addEventListener('change', (mediaQuery) => {
      this.deviceTheme = mediaQuery.matches ? 'dark-mode' : 'light-mode';
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  onCellClicked(event: CellClickedEvent): void {
    // Ignore clicks on editable cells
    if (event.colDef.editable) {
      return;
    }

    if (event.api.getEditingCells().length > 0) {
      return;
    }

    this.router.navigate(['/transactions', event.data.id]);
  }

  onCellValueChanged(event: CellValueChangedEvent): void {
    console.log('Cell value changed event:', event);
    if (event.oldValue === event.newValue) {
      return; // No actual change
    }

    const updatedTransaction: Transaction = {
      ...event.data,
      [event.colDef.field!]: event.newValue
    };

    console.log('Updating transaction:', updatedTransaction);
    this.transactionService.updateTransaction(updatedTransaction);
  }
  
  deleteTransaction(id: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id);
      this.cdr.markForCheck();
    }
  }
}