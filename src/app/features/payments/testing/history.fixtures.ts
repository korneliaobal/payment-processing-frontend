import type { PaymentHistoryResponse } from '../models/payment-history-response.model';
import { TEST_PAYMENT_ID } from './payment.fixtures';
export const HISTORY_FIXTURE: PaymentHistoryResponse = {
  number: 0,
  size: 20,
  totalElements: 21,
  totalPages: 2,
  content: [
    {
      paymentId: TEST_PAYMENT_ID,
      status: 'NOT_OK',
      debtor: { name: 'History sender', accountNumber: 'PL61109010140000071219812874' },
      currency: 'PLN',
      totalAmount: 3,
      transactionCount: 1,
      createdAt: '2026-10-07T12:00:00Z',
    },
  ],
};
export const LEGACY_HISTORY_FIXTURE: PaymentHistoryResponse = {
  number: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      paymentId: TEST_PAYMENT_ID,
      status: 'OK',
      debtor: { name: null, accountNumber: null },
      currency: null,
      totalAmount: null,
      transactionCount: null,
      createdAt: null,
    },
  ],
};
