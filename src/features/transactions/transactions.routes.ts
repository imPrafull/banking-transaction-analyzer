// features/transactions/transactions.routes.ts
import { Routes } from '@angular/router';
import { transactionsExistGuardFn } from '../../guards/transactions-exist.guard';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./transaction-list/transaction-list.component').then(m => m.TransactionListComponent),
    canActivate: [transactionsExistGuardFn]
  },
  {
    path: ':id',
    loadComponent: () => import('./transaction-detail/transaction-detail.component').then(m => m.TransactionDetailComponent),
    canActivate: [transactionsExistGuardFn]
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./transaction-form/transaction-form.component').then(m => m.TransactionFormComponent),
    canActivate: [transactionsExistGuardFn]
  }
];