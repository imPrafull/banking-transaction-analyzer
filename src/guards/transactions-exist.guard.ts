// guards/transactions-exist.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionService } from '../services/transaction.service';

export const transactionsExistGuardFn = () => {
  const transactionService = inject(TransactionService);
  const router = inject(Router);

  if (transactionService.getTransactionsSnapshot().length > 0) {
    return true;
  }

  return router.parseUrl('/upload');
};