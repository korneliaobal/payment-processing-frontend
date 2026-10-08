import type { Party } from './party.model';
import type { ValidationStatus } from './validation-status.model';
export interface DisplayTransaction {
  id: string;
  creditor: Party;
  amount: number | null;
  status: ValidationStatus;
  reasonCodes: readonly string[];
}
