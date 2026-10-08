import { DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, defer, switchMap, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import type { AsyncResource } from '../models/async-resource.model';
import type { AsyncResourceState } from '../models/async-resource-state.model';

export function createAsyncResource<T, Params>(
  fetch: (params: Params) => Observable<T>,
  errorMessage: string,
): AsyncResource<T, Params> {
  const destroyRef = inject(DestroyRef);
  const requests = new Subject<Params>();
  const state = signal<AsyncResourceState<T>>({
    data: null,
    loading: false,
    error: null,
    updatedAt: null,
  });

  requests
    .pipe(
      tap(() => state.update((current) => ({ ...current, loading: true, error: null }))),
      switchMap((params) =>
        defer(() => fetch(params)).pipe(
          tap((data) => state.set({ data, loading: false, error: null, updatedAt: new Date() })),
          catchError(() => {
            state.set({ data: null, loading: false, error: errorMessage, updatedAt: null });
            return EMPTY;
          }),
        ),
      ),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe();

  return {
    data: computed(() => state().data),
    loading: computed(() => state().loading),
    error: computed(() => state().error),
    updatedAt: computed(() => state().updatedAt),
    load: (params) => requests.next(params),
  };
}
