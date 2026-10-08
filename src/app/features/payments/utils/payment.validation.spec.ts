import { describe, expect, it } from 'vitest';
import { EXAMPLE_PAYMENT } from '../data/example-payment';
import { REJECTED_STATUS_FIXTURE } from '../testing/payment.fixtures';
import {
  isPaymentId,
  isPaymentPending,
  isValidAmount,
  isValidDraft,
  normalizeAccount,
} from './payment.validation';

describe('payment validation', () => {
  it('accepts positive amounts with two decimal places, including a backend rejection scenario', () => {
    expect(isValidAmount(3)).toBe(true);
    expect(isValidAmount(0.01)).toBe(true);
    expect(isValidAmount(840.5)).toBe(true);
  });
  it('rejects missing, non-finite, negative, overly precise, and excessive amounts', () => {
    for (const value of [null, NaN, Infinity, 0, -1, 1.001, 1000000000])
      expect(isValidAmount(value)).toBe(false);
  });
  it('enforces recipient limits and required names', () => {
    expect(isValidDraft(EXAMPLE_PAYMENT)).toBe(true);
    expect(isValidDraft({ ...EXAMPLE_PAYMENT, debtorName: '   ' })).toBe(false);
    expect(isValidDraft({ ...EXAMPLE_PAYMENT, recipients: [] })).toBe(false);
    expect(
      isValidDraft({
        ...EXAMPLE_PAYMENT,
        recipients: Array(6).fill(EXAMPLE_PAYMENT.recipients[0]),
      }),
    ).toBe(false);
  });
  it('normalizes accounts and validates payment identifiers', () => {
    expect(normalizeAccount('pl61 1090 1014 0000 0712 1981 2874')).toBe(
      'PL61109010140000071219812874',
    );
    expect(isPaymentId(REJECTED_STATUS_FIXTURE.paymentId)).toBe(true);
    expect(isPaymentId('invalid')).toBe(false);
  });
  it('waits for every validation result, including payment-level validation', () => {
    expect(isPaymentPending(null)).toBe(true);
    expect(isPaymentPending(REJECTED_STATUS_FIXTURE)).toBe(false);
    expect(
      isPaymentPending({ ...REJECTED_STATUS_FIXTURE, paymentValidationStatus: 'PENDING' }),
    ).toBe(true);
    expect(
      isPaymentPending({
        ...REJECTED_STATUS_FIXTURE,
        transactions: [{ transactionId: 'pending', status: 'PENDING' }],
      }),
    ).toBe(true);
  });
});
