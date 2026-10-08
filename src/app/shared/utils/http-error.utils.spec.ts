import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { getHttpErrorMessage } from './http-error.utils';

describe('HTTP error messages', () => {
  it('reads an API message or ProblemDetail without displaying arbitrary objects', () => {
    expect(
      getHttpErrorMessage(
        new HttpErrorResponse({ error: { message: ' Invalid payment ' } }),
        'Fallback',
      ),
    ).toBe('Invalid payment');
    expect(
      getHttpErrorMessage(
        new HttpErrorResponse({ error: { message: {}, detail: 'Validation failed' } }),
        'Fallback',
      ),
    ).toBe('Validation failed');
  });
  it('uses the fallback for unknown, malformed or empty error payloads', () => {
    for (const payload of [null, '', { message: {} }, { message: '  ' }, { message: 42 }]) {
      expect(getHttpErrorMessage(new HttpErrorResponse({ error: payload }), 'Fallback')).toBe(
        'Fallback',
      );
    }
    expect(getHttpErrorMessage(new Error('Unexpected error'), 'Fallback')).toBe('Fallback');
  });
});
