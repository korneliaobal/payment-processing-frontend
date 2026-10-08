import type { PaymentHistoryResponse } from '../../payments/models/payment-history-response.model';
export interface DashboardHistory {
  recent: PaymentHistoryResponse;
  pending: PaymentHistoryResponse;
  accepted: PaymentHistoryResponse;
  rejected: PaymentHistoryResponse;
}
