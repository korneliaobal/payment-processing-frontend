import type { ValidationStatus } from './validation-status.model';
export interface PaymentHistoryQuery {
  page?: number;
  size?: number;
  status?: ValidationStatus;
}
