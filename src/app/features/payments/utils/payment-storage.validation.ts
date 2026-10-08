import { isRecord } from '../../../shared/utils/record.utils';
import { PAYMENT_LIMITS } from '../config/payment.config';
import type { Party } from '../models/party.model';
import type { PaymentDraft } from '../models/payment-draft.model';
import type { PaymentResponse } from '../models/payment-response.model';
import type { PaymentSnapshot } from '../models/payment-snapshot.model';
import type { RecipientDraft } from '../models/recipient.model';
import type { TransactionResponse } from '../models/transaction-response.model';
import { isCurrency, isPaymentId } from './payment.validation';
function isParty(value: unknown): value is Party {
  return (
    isRecord(value) &&
    typeof value['name'] === 'string' &&
    typeof value['accountNumber'] === 'string'
  );
}
function isRecipient(value: unknown): value is RecipientDraft {
  return (
    isParty(value) &&
    isRecord(value) &&
    Number.isSafeInteger(value['key']) &&
    (value['amount'] === null ||
      (typeof value['amount'] === 'number' && Number.isFinite(value['amount'])))
  );
}
export function isStoredDraft(value: unknown): value is PaymentDraft {
  if (!isRecord(value)) return false;
  const recipients = value['recipients'];
  return (
    typeof value['debtorName'] === 'string' &&
    typeof value['debtorAccount'] === 'string' &&
    isCurrency(value['currency']) &&
    Array.isArray(recipients) &&
    recipients.length >= 1 &&
    recipients.length <= PAYMENT_LIMITS.maxRecipients &&
    recipients.every(isRecipient) &&
    new Set(recipients.map((recipient) => recipient.key)).size === recipients.length
  );
}
function isTransaction(value: unknown): value is TransactionResponse {
  return (
    isRecord(value) &&
    isPaymentId(value['id']) &&
    isPaymentId(value['paymentId']) &&
    isParty(value['creditor']) &&
    typeof value['amount'] === 'number' &&
    Number.isFinite(value['amount'])
  );
}
function isPaymentResponse(value: unknown): value is PaymentResponse {
  return (
    isRecord(value) &&
    isPaymentId(value['id']) &&
    isParty(value['debtor']) &&
    isCurrency(value['currency']) &&
    typeof value['totalAmount'] === 'number' &&
    Number.isFinite(value['totalAmount']) &&
    Number.isSafeInteger(value['transactionCount']) &&
    Array.isArray(value['transactions']) &&
    value['transactions'].every(isTransaction)
  );
}
export function isPaymentSnapshot(value: unknown): value is PaymentSnapshot {
  return isRecord(value) && isCurrency(value['currency']) && isPaymentResponse(value['response']);
}
