import { getHttpErrorMessage } from '../../../shared/utils/http-error.utils';
import type { HttpErrorResponse } from '@angular/common/http';
import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentApiService } from './payment-api.service';
import { PaymentDraftStore } from './payment-draft.store';
import { PaymentSessionService } from './payment-session.service';
import { PAYMENT_MESSAGES } from '../config/payment-messages';
import { PAYMENT_ROUTES } from '../config/payment.config';
@Injectable({ providedIn: 'root' })
export class PaymentFlowService {
  private readonly api = inject(PaymentApiService);
  private readonly draft = inject(PaymentDraftStore);
  private readonly session = inject(PaymentSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isUploadingState = signal(false);
  readonly isUploading = this.isUploadingState.asReadonly();
  private readonly errorMessageState = signal<string | null>(null);
  readonly errorMessage = this.errorMessageState.asReadonly();
  private readonly submittedPaymentIdState = signal(this.session.loadSubmittedId());
  readonly submittedPaymentId = this.submittedPaymentIdState.asReadonly();
  submit(): void {
    if (this.isUploading() || this.submittedPaymentId() || !this.draft.valid()) return;
    this.isUploadingState.set(true);
    this.errorMessageState.set(null);
    this.api
      .upload(this.draft.payload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isUploadingState.set(false);
          this.submittedPaymentIdState.set(response.id);
          this.session.saveSubmitted({ response, currency: this.draft.value().currency });
          void this.router.navigate([PAYMENT_ROUTES.base, response.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.isUploadingState.set(false);
          const fallback =
            error.status === 0 ? PAYMENT_MESSAGES.offline : PAYMENT_MESSAGES.uploadFailed;
          this.errorMessageState.set(getHttpErrorMessage(error, fallback));
        },
      });
  }
  setError(message: string | null): void {
    this.errorMessageState.set(message);
  }
  reset(): void {
    this.draft.reset();
    this.session.clearSubmitted();
    this.submittedPaymentIdState.set(null);
    this.errorMessageState.set(null);
    void this.router.navigate([PAYMENT_ROUTES.new]);
  }
}
