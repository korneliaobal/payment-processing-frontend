import type { PaymentDraft } from '../models/payment-draft.model';
export const SAVED_DRAFT_FIXTURE: PaymentDraft = {
  debtorName: 'Saved sender',
  debtorAccount: 'PL61109010140000071219812874',
  currency: 'EUR',
  recipients: [
    {
      key: 7,
      name: 'Saved recipient',
      accountNumber: 'PL10105000997603123456789123',
      amount: 12.5,
    },
  ],
};
