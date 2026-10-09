import type { Currency } from '../models/currency.model';
export const SUPPORTED_CURRENCIES: readonly Currency[] = ['PLN', 'EUR', 'USD', 'GBP'];
export const DEFAULT_CURRENCY: Currency = 'PLN';
export const PAYMENT_LIMITS = {
  maxRecipients: 5,
  maxNameLength: 150,
  minAmount: 0.01,
  maxAmount: 999999999,
  accountPlaceholder: 'PL00 0000 0000 0000 0000 0000 0000',
} as const;
export const PAYMENT_HISTORY = { pageSize: 20 } as const;
export const PAYMENT_POLLING = { intervalMs: 1500, timeoutMs: 90000 } as const;
export const PAYMENT_API_BASE_URL = 'https://obal-flow-api.up.railway.app';
export const PAYMENT_ORCHESTRATOR_BASE_URL =
  'https://payment-orchestrator-service-production.up.railway.app';
export const PAYMENT_ENDPOINTS = {
  upload: `${PAYMENT_API_BASE_URL}/api/payments/upload`,
  status: `${PAYMENT_ORCHESTRATOR_BASE_URL}/api/payment-status`,
  history: `${PAYMENT_ORCHESTRATOR_BASE_URL}/api/payment-history`,
} as const;
export const PAYMENT_ROUTES = {
  base: '/payments',
  new: '/payments/new',
  review: '/payments/review',
  history: '/payments/history',
} as const;
export const PAYMENT_STORAGE = {
  draft: 'obalflow-draft',
  submittedId: 'obalflow-submitted-id',
  snapshotPrefix: 'obalflow-payment-',
} as const;
