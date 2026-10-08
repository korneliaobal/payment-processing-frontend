import { Injectable, inject } from '@angular/core';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { PAYMENT_STORAGE } from '../config/payment.config';
import type { PaymentDraft } from '../models/payment-draft.model';
import type { PaymentSnapshot } from '../models/payment-snapshot.model';
import { isPaymentSnapshot, isStoredDraft } from '../utils/payment-storage.validation';
import { isPaymentId } from '../utils/payment.validation';
@Injectable({ providedIn: 'root' })
export class PaymentSessionService {
  private readonly storage = inject(SessionStorageService);
  loadDraft(): PaymentDraft | null {
    return this.storage.read(PAYMENT_STORAGE.draft, isStoredDraft);
  }
  saveDraft(draft: PaymentDraft): void {
    this.storage.write(PAYMENT_STORAGE.draft, draft);
  }
  loadSubmittedId(): string | null {
    return this.storage.read(PAYMENT_STORAGE.submittedId, isPaymentId);
  }
  saveSubmitted(snapshot: PaymentSnapshot): void {
    this.storage.write(PAYMENT_STORAGE.submittedId, snapshot.response.id);
    this.storage.write(PAYMENT_STORAGE.snapshotPrefix + snapshot.response.id, snapshot);
  }
  clearSubmitted(): void {
    this.storage.remove(PAYMENT_STORAGE.submittedId);
  }
  loadPayment(id: string): PaymentSnapshot | null {
    const snapshot = this.storage.read(PAYMENT_STORAGE.snapshotPrefix + id, isPaymentSnapshot);
    return snapshot?.response.id === id ? snapshot : null;
  }
}
