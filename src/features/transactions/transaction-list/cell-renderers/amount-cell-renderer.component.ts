import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TransactionTypeColorDirective } from '../../../../directives/transaction-type-color.directive';

@Component({
  selector: 'app-amount-cell-renderer',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TransactionTypeColorDirective],
  template: `
    <span [appTransactionTypeColor]="params.data.type"
          class="text-gray-300">
      {{ params.value | currency }}
    </span>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountCellRendererComponent implements ICellRendererAngularComp {
  public params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }
}
