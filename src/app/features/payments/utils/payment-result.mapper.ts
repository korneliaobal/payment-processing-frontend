import type { DisplayTransaction } from '../models/display-transaction.model';
import type { PaymentResponse } from '../models/payment-response.model';
import type { PaymentStatusResponse } from '../models/payment-status-response.model';
export function toDisplayTransactions(
  response: PaymentResponse | null,
  result: PaymentStatusResponse | null,
): DisplayTransaction[] {
  const cached = new Map(
    response?.transactions.map((transaction) => [transaction.id, transaction]),
  );
  if (!result)
    return (
      response?.transactions.map((transaction) => ({
        ...transaction,
        status: 'PENDING' as const,
        reasonCodes: [],
      })) ?? []
    );
  return result.transactions.map((transaction, index) => {
    const saved = cached.get(transaction.transactionId);
    return {
      id: transaction.transactionId,
      creditor: {
        name: transaction.creditor?.name ?? saved?.creditor.name ?? `Transakcja ${index + 1}`,
        accountNumber:
          transaction.creditor?.accountNumber ??
          saved?.creditor.accountNumber ??
          transaction.transactionId,
      },
      amount: transaction.amount ?? saved?.amount ?? null,
      status: transaction.status,
      reasonCodes: transaction.reasonCodes ?? [],
    };
  });
}
