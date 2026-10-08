import type { DashboardCounts } from './dashboard-counts.model';
import type { PaymentHistoryItem } from '../../payments/models/payment-history-item.model';
export interface Dashboard {
  counts: DashboardCounts;
  recentPayments: PaymentHistoryItem[];
}
