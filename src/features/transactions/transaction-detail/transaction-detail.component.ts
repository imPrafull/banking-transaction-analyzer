
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Transaction } from '../../../models/transaction.model';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './transaction-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDetailComponent {
  transaction$: Observable<Transaction | undefined>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private location: Location
  ) {
    this.transaction$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.transactionService.getTransactionById(id!);
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/transactions', id, 'edit']);
  }
}
