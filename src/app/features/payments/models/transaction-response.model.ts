import type { TransactionInput } from './transaction-input.model';
export interface TransactionResponse extends TransactionInput {
  id: string;
  paymentId: string;
}
