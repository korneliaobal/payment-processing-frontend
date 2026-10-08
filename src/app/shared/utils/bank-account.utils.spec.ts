import { describe, expect, it } from 'vitest';
import { isValidBankAccount, normalizeBankAccount } from './bank-account.utils';

describe('Polish bank account validation', () => {
  it('accepts IBAN, national NRB, lowercase, spaces and non-breaking spaces', () => {
    for (const account of [
      'PL61109010140000071219812874',
      '61109010140000071219812874',
      'pl61 1090 1014 0000 0712 1981 2874',
      'PL61\u00a01090 1014 0000 0712 1981 2874',
    ]) {
      expect(isValidBankAccount(account)).toBe(true);
      expect(normalizeBankAccount(account)).toBe('PL61109010140000071219812874');
    }
  });
  it('rejects wrong checksum, malformed digits, other countries and absent values', () => {
    for (const account of [
      null,
      undefined,
      '',
      'PL62109010140000071219812874',
      'PL00109010140000071219812874',
      'PL6110901014000007121981287A',
      'DE61109010140000071219812874',
      '6110901014000007121981287',
      'PL61-1090-1014-0000-0712-1981-2874',
    ]) {
      expect(isValidBankAccount(account)).toBe(false);
    }
  });
});
