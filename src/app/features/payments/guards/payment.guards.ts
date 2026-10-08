import { inject } from '@angular/core';
import type { CanActivateFn, CanDeactivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { PAYMENT_ROUTES } from '../config/payment.config';
import { PaymentDraftStore } from '../services/payment-draft.store';
import { PaymentFlowService } from '../services/payment-flow.service';
import { isPaymentId } from '../utils/payment.validation';
export const draftGuard: CanActivateFn = () => {
  const id = inject(PaymentFlowService).submittedPaymentId();
  const router = inject(Router);
  if (id) return router.createUrlTree([PAYMENT_ROUTES.base, id]);
  return inject(PaymentDraftStore).valid() || router.createUrlTree([PAYMENT_ROUTES.new]);
};
export const newPaymentGuard: CanActivateFn = () => {
  const id = inject(PaymentFlowService).submittedPaymentId();
  return !id || inject(Router).createUrlTree([PAYMENT_ROUTES.base, id]);
};
export const paymentIdGuard: CanActivateFn = (route) =>
  isPaymentId(route.paramMap.get('paymentId')) ||
  inject(Router).createUrlTree([PAYMENT_ROUTES.new]);
export const uploadGuard: CanDeactivateFn<unknown> = () =>
  !inject(PaymentFlowService).isUploading();
