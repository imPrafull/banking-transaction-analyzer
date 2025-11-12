
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFormComponent implements OnInit, OnDestroy {
  transactionForm: FormGroup;
  transactionId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private location: Location
  ) {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]],
      date: ['', Validators.required],
      type: ['', [Validators.required, Validators.pattern(/^(Credit|Debit)$/)]],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d{10,16}$/)]],
    });
  }

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    if (this.transactionId) {
      this.transactionService.getTransactionById(this.transactionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(transaction => {
          if (transaction) {
            this.transactionForm.patchValue(transaction);
          }
        });
    }
  }

  onSubmit(): void {
    if (this.transactionForm.valid && this.transactionId) {
      const updatedTransaction: Transaction = {
        id: this.transactionId,
        ...this.transactionForm.value,
      };
      this.transactionService.updateTransaction(updatedTransaction);
      this.router.navigate(['/transactions', this.transactionId]);
    }
  }

  onCancel(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
