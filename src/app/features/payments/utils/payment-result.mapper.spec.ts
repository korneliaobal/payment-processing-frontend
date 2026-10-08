import { describe, expect, it } from 'vitest';
import {
  PAYMENT_RESPONSE_FIXTURE,
  REJECTED_STATUS_FIXTURE,
  DIRECT_PAYMENT_STATUS_FIXTURE,
} from '../testing/payment.fixtures';
import { toDisplayTransactions } from './payment-result.mapper';

describe('payment result mapping', () => {
  it('preserves uploaded recipient details while validation is pending', () => {
    const rows = toDisplayTransactions(PAYMENT_RESPONSE_FIXTURE, null);
    expect(rows.map((row) => row.status)).toEqual(['PENDING', 'PENDING']);
    expect(rows[0].creditor).toEqual(PAYMENT_RESPONSE_FIXTURE.transactions[0].creditor);
  });
  it('combines cached details and backend statuses by transaction id', () => {
    const rows = toDisplayTransactions(PAYMENT_RESPONSE_FIXTURE, {
      ...REJECTED_STATUS_FIXTURE,
      transactions: [...REJECTED_STATUS_FIXTURE.transactions].reverse(),
    });
    expect(rows[0].amount).toBe(PAYMENT_RESPONSE_FIXTURE.transactions[1].amount);
    expect(rows[0].reasonCodes).toEqual(['AMOUNT_BELOW_MINIMUM']);
  });
  it('uses persisted details in preference to local cache', () => {
    const status = {
      ...DIRECT_PAYMENT_STATUS_FIXTURE,
      transactions: [
        {
          ...DIRECT_PAYMENT_STATUS_FIXTURE.transactions[0],
          creditor: { name: 'Updated recipient', accountNumber: 'Persisted account' },
          amount: 12,
        },
      ],
    };
    const [row] = toDisplayTransactions(PAYMENT_RESPONSE_FIXTURE, status);
    expect(row.creditor.name).toBe('Updated recipient');
    expect(row.amount).toBe(12);
  });
  it('shows explicit placeholders when historical details were never saved', () => {
    const [row] = toDisplayTransactions(null, DIRECT_PAYMENT_STATUS_FIXTURE);
    expect(row.creditor.name).toBe('Transakcja 1');
    expect(row.amount).toBeNull();
    expect(row.reasonCodes).toEqual([]);
  });
});
