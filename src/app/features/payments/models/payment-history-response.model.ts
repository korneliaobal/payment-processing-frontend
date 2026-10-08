import type { PaymentHistoryItem } from './payment-history-item.model';
export interface PaymentHistoryResponse {
  content: PaymentHistoryItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
