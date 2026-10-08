import type { PaymentInput } from './payment-input.model';
import type { TransactionResponse } from './transaction-response.model';
export interface PaymentResponse extends Omit<PaymentInput, 'transactions'> {
  id: string;
  transactions: TransactionResponse[];
}
