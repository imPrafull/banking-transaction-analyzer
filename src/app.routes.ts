
import { Routes } from '@angular/router';
import { transactionsExistGuardFn } from './guards/transactions-exist.guard';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'transactions', pathMatch: 'full' },
  {
    path: 'upload',
    loadComponent: () => import('./features/file-upload/file-upload.component').then(m => m.FileUploadComponent)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES),
    canActivate: [transactionsExistGuardFn]
  },
  { path: '**', redirectTo: 'upload' }
];
