import { EXAMPLE_PAYMENT } from '../data/example-payment';
import type { PaymentResponse } from '../models/payment-response.model';
import type { PaymentStatusResponse } from '../models/payment-status-response.model';
import { toPaymentInput } from '../utils/payment.mapper';

export const TEST_PAYMENT_ID = '11111111-1111-4111-8111-111111111111';
export const TEST_TRANSACTION_IDS = [
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
] as const;
const input = toPaymentInput(EXAMPLE_PAYMENT);
export const PAYMENT_RESPONSE_FIXTURE: PaymentResponse = {
  ...input,
  id: TEST_PAYMENT_ID,
  transactions: input.transactions.map((transaction, index) => ({
    ...transaction,
    id: TEST_TRANSACTION_IDS[index],
    paymentId: TEST_PAYMENT_ID,
  })),
};
export const REJECTED_STATUS_FIXTURE: PaymentStatusResponse = {
  paymentId: TEST_PAYMENT_ID,
  status: 'NOT_OK',
  paymentValidationStatus: 'OK',
  transactions: [
    { transactionId: TEST_TRANSACTION_IDS[0], status: 'OK' },
    {
      transactionId: TEST_TRANSACTION_IDS[1],
      status: 'NOT_OK',
      reasonCodes: ['AMOUNT_BELOW_MINIMUM'],
    },
  ],
};

export const DIRECT_PAYMENT_ID = '22222222-2222-4222-8222-222222222222';
export const ACCEPTED_STATUS_FIXTURE: PaymentStatusResponse = {
  ...REJECTED_STATUS_FIXTURE,
  status: 'OK',
  transactions: TEST_TRANSACTION_IDS.map((transactionId) => ({ transactionId, status: 'OK' })),
};
export const PENDING_STATUS_FIXTURE: PaymentStatusResponse = {
  ...ACCEPTED_STATUS_FIXTURE,
  status: 'PENDING',
  paymentValidationStatus: 'PENDING',
  transactions: TEST_TRANSACTION_IDS.map((transactionId) => ({ transactionId, status: 'PENDING' })),
};
export const DIRECT_PAYMENT_STATUS_FIXTURE: PaymentStatusResponse = {
  paymentId: DIRECT_PAYMENT_ID,
  status: 'OK',
  paymentValidationStatus: 'OK',
  transactions: [{ transactionId: TEST_TRANSACTION_IDS[0], status: 'OK' }],
};
export const UPLOAD_ERROR_FIXTURE = { message: 'Total amount does not match' } as const;
