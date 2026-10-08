import type { PaymentHistoryResponse } from '../models/payment-history-response.model';
import type { PaymentHistoryQuery } from '../models/payment-history-query.model';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { PAYMENT_ENDPOINTS, PAYMENT_HISTORY } from '../config/payment.config';
import type { PaymentInput } from '../models/payment-input.model';
import type { PaymentResponse } from '../models/payment-response.model';
import type { PaymentStatusResponse } from '../models/payment-status-response.model';
@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  upload(payment: PaymentInput): Observable<PaymentResponse> {
    const data = new FormData();
    data.append(
      'file',
      new Blob([JSON.stringify(payment)], { type: 'application/json' }),
      'payment.json',
    );
    return this.http.post<PaymentResponse>(PAYMENT_ENDPOINTS.upload, data);
  }
  getHistory({
    page = 0,
    size = PAYMENT_HISTORY.pageSize,
    status,
  }: PaymentHistoryQuery = {}): Observable<PaymentHistoryResponse> {
    const params = { page, size, ...(status ? { status } : {}) };
    return this.http.get<PaymentHistoryResponse>(PAYMENT_ENDPOINTS.history, { params });
  }
  getStatus(id: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(`${PAYMENT_ENDPOINTS.status}/${id}`);
  }
}
