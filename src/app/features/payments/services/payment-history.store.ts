import { Injectable, inject, signal } from '@angular/core';
import { createAsyncResource } from '../../../core/state/async-resource';
import { PaymentApiService } from './payment-api.service';
import { PAYMENT_MESSAGES } from '../config/payment-messages';
import type { PaymentHistoryQuery } from '../models/payment-history-query.model';
import type { ValidationStatus } from '../models/validation-status.model';

@Injectable()
export class PaymentHistoryStore {
  private readonly api = inject(PaymentApiService);
  private readonly pageState = signal(0);
  private readonly filterState = signal<ValidationStatus | ''>('');
  private readonly resource = createAsyncResource(
    (query: PaymentHistoryQuery) => this.api.getHistory(query),
    PAYMENT_MESSAGES.historyUnavailable,
  );
  readonly result = this.resource.data;
  readonly loading = this.resource.loading;
  readonly error = this.resource.error;
  readonly page = this.pageState.asReadonly();
  readonly filter = this.filterState.asReadonly();
  constructor() {
    this.refresh();
  }
  refresh(): void {
    this.resource.load({ page: this.page(), status: this.filter() || undefined });
  }
  changeFilter(status: ValidationStatus | ''): void {
    this.filterState.set(status);
    this.pageState.set(0);
    this.refresh();
  }
  changePage(page: number): void {
    if (this.loading() || page < 0 || page >= (this.result()?.totalPages ?? 0)) return;
    this.pageState.set(page);
    this.refresh();
  }
}
