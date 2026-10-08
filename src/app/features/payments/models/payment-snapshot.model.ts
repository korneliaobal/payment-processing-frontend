import type { Currency } from './currency.model';
import type { PaymentResponse } from './payment-response.model';
export interface PaymentSnapshot {
  response: PaymentResponse;
  currency: Currency;
}
