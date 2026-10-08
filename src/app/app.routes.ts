import type { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Pulpit operatora — Ledger',
    loadComponent: () =>
      import('./features/home/pages/home/home.page').then((module) => module.HomePage),
  },
  {
    path: 'payments',
    loadChildren: () =>
      import('./features/payments/payments.routes').then((module) => module.paymentRoutes),
  },
  { path: '**', redirectTo: 'home' },
];
