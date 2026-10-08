import type { StoredParty } from './stored-party.model';
import type { Currency } from './currency.model';
import type { ValidationStatus } from './validation-status.model';
export interface PaymentHistoryItem {
  paymentId: string;
  status: ValidationStatus;
  debtor: StoredParty;
  currency: Currency | null;
  totalAmount: number | null;
  transactionCount: number | null;
  createdAt: string | null;
}
