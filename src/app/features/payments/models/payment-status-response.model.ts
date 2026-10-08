import type { StoredParty } from './stored-party.model';
import type { Currency } from './currency.model';
import type { ValidationStatus } from './validation-status.model';
import type { TransactionStatusResponse } from './transaction-status-response.model';
export interface PaymentStatusResponse {
  paymentId: string;
  status: ValidationStatus;
  paymentValidationStatus: ValidationStatus;
  reasonCodes?: string[];
  debtor?: StoredParty | null;
  currency?: Currency | null;
  totalAmount?: number | null;
  transactionCount?: number | null;
  createdAt?: string | null;
  transactions: TransactionStatusResponse[];
}
