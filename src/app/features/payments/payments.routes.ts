import type { Routes } from '@angular/router';
import { draftGuard, newPaymentGuard, paymentIdGuard, uploadGuard } from './guards/payment.guards';
export const paymentRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'new' },
  {
    path: 'new',
    title: 'Nowe zlecenie — Ledger',
    canActivate: [newPaymentGuard],
    loadComponent: () =>
      import('./pages/payment-form/payment-form.page').then((module) => module.PaymentFormPage),
  },
  {
    path: 'review',
    title: 'Weryfikacja zlecenia — Ledger',
    canActivate: [draftGuard],
    canDeactivate: [uploadGuard],
    loadComponent: () =>
      import('./pages/payment-review/payment-review.page').then(
        (module) => module.PaymentReviewPage,
      ),
  },
  {
    path: 'history',
    title: 'Historia zleceń — Ledger',
    loadComponent: () =>
      import('./pages/payment-history/payment-history.page').then(
        (module) => module.PaymentHistoryPage,
      ),
  },
  {
    path: ':paymentId',
    title: 'Status płatności — Ledger',
    canActivate: [paymentIdGuard],
    loadComponent: () =>
      import('./pages/payment-result/payment-result.page').then(
        (module) => module.PaymentResultPage,
      ),
  },
];
