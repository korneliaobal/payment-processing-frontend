import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { PAYMENT_ENDPOINTS, PAYMENT_POLLING } from '../config/payment.config';
import { PAYMENT_MESSAGES } from '../config/payment-messages';
import { PaymentTrackerService } from '../services/payment-tracker.service';
import {
  ACCEPTED_STATUS_FIXTURE,
  PENDING_STATUS_FIXTURE,
  REJECTED_STATUS_FIXTURE,
  TEST_PAYMENT_ID,
} from './payment.fixtures';

describe('Payment status polling', () => {
  let tracker: PaymentTrackerService;
  let http: HttpTestingController;
  const statusUrl = `${PAYMENT_ENDPOINTS.status}/${TEST_PAYMENT_ID}`;

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    tracker = TestBed.inject(PaymentTrackerService);
    http = TestBed.inject(HttpTestingController);
    tracker.open(TEST_PAYMENT_ID);
    vi.advanceTimersByTime(0);
  });

  afterEach(() => {
    tracker.stop();
    http.verify();
    vi.useRealTimers();
  });

  it('waits silently through 404 and PENDING, then stops on OK', () => {
    http.expectOne(statusUrl).flush({}, { status: 404, statusText: 'Not Found' });
    expect(tracker.message()).toBeNull();
    expect(tracker.status()).toBeNull();
    vi.advanceTimersByTime(PAYMENT_POLLING.intervalMs - 1);
    http.expectNone(statusUrl);
    vi.advanceTimersByTime(1);
    http.expectOne(statusUrl).flush(PENDING_STATUS_FIXTURE);
    expect(tracker.status()?.status).toBe('PENDING');
    expect(tracker.message()).toBeNull();
    vi.advanceTimersByTime(PAYMENT_POLLING.intervalMs);
    http.expectOne(statusUrl).flush(ACCEPTED_STATUS_FIXTURE);
    expect(tracker.status()?.status).toBe('OK');
    vi.advanceTimersByTime(PAYMENT_POLLING.timeoutMs);
    http.expectNone(statusUrl);
    expect(tracker.message()).toBeNull();
  });

  it('waits silently through 404, then stops on NOT_OK', () => {
    http.expectOne(statusUrl).flush({}, { status: 404, statusText: 'Not Found' });
    expect(tracker.message()).toBeNull();
    vi.advanceTimersByTime(PAYMENT_POLLING.intervalMs);
    http.expectOne(statusUrl).flush(REJECTED_STATUS_FIXTURE);
    expect(tracker.status()?.status).toBe('NOT_OK');
    vi.advanceTimersByTime(PAYMENT_POLLING.timeoutMs);
    http.expectNone(statusUrl);
    expect(tracker.message()).toBeNull();
  });

  it.each(['OK', 'NOT_OK'] as const)(
    'stops on final %s even with pending child statuses',
    (status) => {
      http.expectOne(statusUrl).flush({ ...PENDING_STATUS_FIXTURE, status });
      expect(tracker.status()?.status).toBe(status);
      vi.advanceTimersByTime(PAYMENT_POLLING.timeoutMs);
      http.expectNone(statusUrl);
      expect(tracker.message()).toBeNull();
    },
  );

  it('shows an error on 500 and stops until the operator retries', () => {
    http.expectOne(statusUrl).flush({}, { status: 500, statusText: 'Internal Server Error' });
    expect(tracker.message()).toBe(PAYMENT_MESSAGES.statusUnavailable);
    vi.advanceTimersByTime(PAYMENT_POLLING.timeoutMs);
    http.expectNone(statusUrl);
    expect(tracker.message()).toBe(PAYMENT_MESSAGES.statusUnavailable);
    tracker.refresh();
    expect(tracker.message()).toBeNull();
    vi.advanceTimersByTime(0);
    http.expectOne(statusUrl).flush(ACCEPTED_STATUS_FIXTURE);
    expect(tracker.status()?.status).toBe('OK');
    http.expectNone(PAYMENT_ENDPOINTS.upload);
  });

  it.each([404, 'PENDING'] as const)(
    'stops at the deadline after repeated %s responses',
    (response) => {
      for (
        let elapsed = 0;
        elapsed < PAYMENT_POLLING.timeoutMs;
        elapsed += PAYMENT_POLLING.intervalMs
      ) {
        const request = http.expectOne(statusUrl);
        if (response === 404) request.flush({}, { status: 404, statusText: 'Not Found' });
        else request.flush(PENDING_STATUS_FIXTURE);
        expect(tracker.message()).toBeNull();
        vi.advanceTimersByTime(PAYMENT_POLLING.intervalMs);
      }
      expect(tracker.message()).toBe(PAYMENT_MESSAGES.pollingTimeout);
      vi.advanceTimersByTime(PAYMENT_POLLING.timeoutMs);
      http.expectNone(statusUrl);
    },
  );

  it('does not overlap requests and cancels an unanswered request at the deadline', () => {
    const request = http.expectOne(statusUrl);
    vi.advanceTimersByTime(PAYMENT_POLLING.timeoutMs - 1);
    http.expectNone(statusUrl);
    expect(request.cancelled).toBe(false);
    expect(tracker.message()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(request.cancelled).toBe(true);
    expect(tracker.message()).toBe(PAYMENT_MESSAGES.pollingTimeout);
    vi.advanceTimersByTime(PAYMENT_POLLING.intervalMs);
    http.expectNone(statusUrl);
  });

  it('cancels the current request and timeout when tracking stops', () => {
    const request = http.expectOne(statusUrl);
    tracker.stop();
    expect(request.cancelled).toBe(true);
    vi.advanceTimersByTime(PAYMENT_POLLING.timeoutMs);
    http.expectNone(statusUrl);
    expect(tracker.message()).toBeNull();
  });
});
