import { describe, expect, it } from 'vitest';
import { EXAMPLE_PAYMENT } from '../data/example-payment';
import { calculateTotal, toPaymentInput } from './payment.mapper';

describe('payment mapping', () => {
  it('adds minor units without floating-point sum drift', () => {
    const recipients = EXAMPLE_PAYMENT.recipients.map((recipient, index) => ({
      ...recipient,
      amount: index === 0 ? 0.1 : 0.2,
    }));
    expect(calculateTotal(recipients)).toBe(0.3);
    expect(toPaymentInput({ ...EXAMPLE_PAYMENT, recipients }).totalAmount).toBe(0.3);
  });
  it('derives counts and totals and removes draft-only recipient keys', () => {
    const payload = toPaymentInput(EXAMPLE_PAYMENT);
    expect(payload.transactionCount).toBe(2);
    expect(payload.totalAmount).toBe(2090.5);
    expect(payload.transactions[0]).not.toHaveProperty('key');
  });
  it('trims names and normalizes accounts without modifying the draft', () => {
    const draft = {
      ...EXAMPLE_PAYMENT,
      debtorName: '  Sender  ',
      debtorAccount: 'pl61 1090 1014 0000 0712 1981 2874',
    };
    const payload = toPaymentInput(draft);
    expect(payload.debtor.name).toBe('Sender');
    expect(payload.debtor.accountNumber).toBe('PL61109010140000071219812874');
    expect(draft.debtorName).toBe('  Sender  ');
  });
});
