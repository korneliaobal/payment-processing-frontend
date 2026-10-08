import type { StoredParty } from './stored-party.model';
import type { ValidationStatus } from './validation-status.model';
export interface TransactionStatusResponse {
  transactionId: string;
  status: ValidationStatus;
  reasonCodes?: string[];
  creditor?: StoredParty | null;
  amount?: number | null;
}
