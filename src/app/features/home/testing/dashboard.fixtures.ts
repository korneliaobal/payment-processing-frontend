import type { Dashboard } from '../models/dashboard.model';
import type { PaymentHistoryResponse } from '../../payments/models/payment-history-response.model';
import { HISTORY_FIXTURE } from '../../payments/testing/history.fixtures';
export const DASHBOARD_COUNTS_FIXTURE: Dashboard['counts'] = {
  total: 21,
  pending: 5,
  accepted: 7,
  rejected: 9,
};
export const RECENT_PAYMENTS_FIXTURE: PaymentHistoryResponse = {
  ...HISTORY_FIXTURE,
  size: 5,
  totalPages: 5,
};
