import { describe, expect, it } from 'vitest';
import { EXAMPLE_PAYMENT } from '../data/example-payment';
import { PAYMENT_RESPONSE_FIXTURE } from '../testing/payment.fixtures';
import { isPaymentSnapshot, isStoredDraft } from './payment-storage.validation';

describe('stored payment validation', () => {
  it('accepts incomplete but structurally valid drafts', () => {
    expect(
      isStoredDraft({
        ...EXAMPLE_PAYMENT,
        debtorName: '',
        recipients: [{ ...EXAMPLE_PAYMENT.recipients[0], amount: null }],
      }),
    ).toBe(true);
  });
  it('rejects malformed storage entries and duplicate recipient keys', () => {
    for (const value of [
      null,
      [],
      {},
      { ...EXAMPLE_PAYMENT, currency: 'INVALID' },
      { ...EXAMPLE_PAYMENT, recipients: [null] },
      {
        ...EXAMPLE_PAYMENT,
        recipients: [EXAMPLE_PAYMENT.recipients[0], EXAMPLE_PAYMENT.recipients[0]],
      },
    ])
      expect(isStoredDraft(value)).toBe(false);
  });
  it('accepts valid API snapshots and rejects corrupted transaction data', () => {
    expect(isPaymentSnapshot({ response: PAYMENT_RESPONSE_FIXTURE, currency: 'PLN' })).toBe(true);
    expect(
      isPaymentSnapshot({
        response: { ...PAYMENT_RESPONSE_FIXTURE, transactions: [{}] },
        currency: 'PLN',
      }),
    ).toBe(false);
  });
});
