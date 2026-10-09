import type { HttpErrorResponse } from '@angular/common/http';
import { Injectable, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Subscription } from 'rxjs';
import { EMPTY, catchError, exhaustMap, takeUntil, takeWhile, tap, throwError, timer } from 'rxjs';
import { PaymentApiService } from './payment-api.service';
import { PaymentSessionService } from './payment-session.service';
import { DEFAULT_CURRENCY, PAYMENT_POLLING } from '../config/payment.config';
import { PAYMENT_MESSAGES } from '../config/payment-messages';
import type { Currency } from '../models/currency.model';
import { toDisplayTransactions } from '../utils/payment-result.mapper';
import type { PaymentResponse } from '../models/payment-response.model';
import type { PaymentStatusResponse } from '../models/payment-status-response.model';
@Injectable({ providedIn: 'root' })
export class PaymentTrackerService {
  private readonly api = inject(PaymentApiService);
  private readonly session = inject(PaymentSessionService);
  private readonly destroyRef = inject(DestroyRef);
  private polling?: Subscription;
  private readonly paymentIdState = signal<string | null>(null);
  readonly paymentId = this.paymentIdState.asReadonly();
  private readonly currencyState = signal<Currency>(DEFAULT_CURRENCY);
  readonly currency = this.currencyState.asReadonly();
  private readonly responseState = signal<PaymentResponse | null>(null);
  readonly response = this.responseState.asReadonly();
  private readonly statusState = signal<PaymentStatusResponse | null>(null);
  readonly status = this.statusState.asReadonly();
  private readonly messageState = signal<string | null>(null);
  readonly message = this.messageState.asReadonly();
  readonly transactionCount = computed(
    () => this.response()?.transactions.length ?? this.status()?.transactions.length ?? 0,
  );
  readonly completed = computed(
    () =>
      this.status()?.transactions.filter((transaction) => transaction.status !== 'PENDING')
        .length ?? 0,
  );
  readonly transactions = computed(() => toDisplayTransactions(this.response(), this.status()));
  open(id: string): void {
    this.stop();
    const cached = this.session.loadPayment(id);
    this.paymentIdState.set(id);
    this.responseState.set(cached?.response ?? null);
    this.currencyState.set(cached?.currency ?? DEFAULT_CURRENCY);
    this.statusState.set(null);
    this.refresh();
  }
  refresh(): void {
    const id = this.paymentId();
    if (!id) return;
    this.stop();
    this.messageState.set(null);
    const timeout = timer(PAYMENT_POLLING.timeoutMs).pipe(
      tap(() => {
        this.messageState.set(PAYMENT_MESSAGES.pollingTimeout);
      }),
    );
    this.polling = timer(0, PAYMENT_POLLING.intervalMs)
      .pipe(
        exhaustMap(() =>
          this.api.getStatus(id).pipe(
            catchError((error: HttpErrorResponse) => {
              return error.status === 404 ? EMPTY : throwError(() => error);
            }),
          ),
        ),
        takeWhile((result) => result.status === 'PENDING', true),
        takeUntil(timeout),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.statusState.set(result);
          if (result.currency) this.currencyState.set(result.currency);
          this.messageState.set(null);
        },
        error: () => this.messageState.set(PAYMENT_MESSAGES.statusUnavailable),
      });
  }
  stop(): void {
    this.polling?.unsubscribe();
    this.polling = undefined;
  }
}
