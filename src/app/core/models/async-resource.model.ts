import type { Signal } from '@angular/core';
export interface AsyncResource<T, Params> {
  data: Signal<T | null>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  updatedAt: Signal<Date | null>;
  load(params: Params): void;
}
