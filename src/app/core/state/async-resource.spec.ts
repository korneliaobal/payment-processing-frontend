import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { of } from 'rxjs';
import { createAsyncResource } from './async-resource';

describe('async resource', () => {
  it('recovers after a synchronous loader failure', () => {
    const resource = TestBed.runInInjectionContext(() =>
      createAsyncResource((fail: boolean) => {
        if (fail) throw new Error('Loader failed');
        return of('Loaded');
      }, 'Unavailable'),
    );
    resource.load(true);
    expect(resource.error()).toBe('Unavailable');
    expect(resource.loading()).toBe(false);
    resource.load(false);
    expect(resource.data()).toBe('Loaded');
    expect(resource.error()).toBeNull();
    expect(resource.updatedAt()).toBeInstanceOf(Date);
  });
});
