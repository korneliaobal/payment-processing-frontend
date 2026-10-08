import { HttpErrorResponse } from '@angular/common/http';
import { isRecord } from './record.utils';
export function getHttpErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse) || !isRecord(error.error)) return fallback;
  for (const key of ['message', 'detail']) {
    const message = error.error[key];
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return fallback;
}
