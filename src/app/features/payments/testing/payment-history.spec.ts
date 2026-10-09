import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../../app';
import { routes } from '../../../app.routes';
import { HISTORY_FIXTURE, LEGACY_HISTORY_FIXTURE } from './history.fixtures';
import { DIRECT_PAYMENT_STATUS_FIXTURE, TEST_PAYMENT_ID } from './payment.fixtures';
import { vi } from 'vitest';

describe('Payment history', () => {
  let http: HttpTestingController;
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  async function openHistory() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/payments/history');
    fixture.detectChanges();
    return fixture;
  }
  it('loads persisted payments, filters status and paginates', async () => {
    const fixture = await openHistory();
    const request = http.expectOne(
      (req) =>
        req.url ===
        'https://payment-orchestrator-service-production.up.railway.app/api/payment-history',
    );
    expect(request.request.params.get('page')).toBe('0');
    request.flush(HISTORY_FIXTURE);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('History sender');
    (
      fixture.nativeElement.querySelector('.pagination button:last-child') as HTMLButtonElement
    ).click();
    const next = http.expectOne(
      (req) =>
        req.url ===
        'https://payment-orchestrator-service-production.up.railway.app/api/payment-history',
    );
    expect(next.request.params.get('page')).toBe('1');
    next.flush({ ...HISTORY_FIXTURE, number: 1 });
    fixture.detectChanges();
    const filter = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    filter.value = 'NOT_OK';
    filter.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const filtered = http.expectOne(
      (req) =>
        req.url ===
        'https://payment-orchestrator-service-production.up.railway.app/api/payment-history',
    );
    expect(filtered.request.params.get('status')).toBe('NOT_OK');
    expect(filtered.request.params.get('page')).toBe('0');
    filtered.flush(HISTORY_FIXTURE);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('tbody a') as HTMLAnchorElement).click();
    await vi.waitFor(() => {
      fixture.detectChanges();
      http
        .expectOne(
          `https://payment-orchestrator-service-production.up.railway.app/api/payment-status/${TEST_PAYMENT_ID}`,
        )
        .flush(DIRECT_PAYMENT_STATUS_FIXTURE);
    });
    expect(TestBed.inject(Router).url).toBe(`/payments/${TEST_PAYMENT_ID}`);
    http.expectNone('https://obal-flow-api.up.railway.app/api/payments/upload');
    fixture.destroy();
  });
  it('shows missing legacy data explicitly', async () => {
    const fixture = await openHistory();
    http
      .expectOne(
        (req) =>
          req.url ===
          'https://payment-orchestrator-service-production.up.railway.app/api/payment-history',
      )
      .flush(LEGACY_HISTORY_FIXTURE);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Brak zapisanej daty');
    expect(fixture.nativeElement.textContent).toContain('Brak zapisanych danych');
  });
  it('allows retry after an API error', async () => {
    const fixture = await openHistory();
    http
      .expectOne(
        (req) =>
          req.url ===
          'https://payment-orchestrator-service-production.up.railway.app/api/payment-history',
      )
      .flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Nie udało się pobrać historii',
    );
    (fixture.nativeElement.querySelector('.panel-header button') as HTMLButtonElement).click();
    http
      .expectOne(
        (req) =>
          req.url ===
          'https://payment-orchestrator-service-production.up.railway.app/api/payment-history',
      )
      .flush({ ...HISTORY_FIXTURE, content: [], totalElements: 0, totalPages: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Brak zleceń');
  });
  it('cancels an older request when the filter changes during loading', async () => {
    const fixture = await openHistory();
    const original = http.expectOne(
      (req) =>
        req.url ===
        'https://payment-orchestrator-service-production.up.railway.app/api/payment-history',
    );
    const filter = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    filter.value = 'NOT_OK';
    filter.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const latest = http.expectOne(
      (req) =>
        req.url ===
        'https://payment-orchestrator-service-production.up.railway.app/api/payment-history',
    );
    expect(original.cancelled).toBe(true);
    expect(latest.request.params.get('status')).toBe('NOT_OK');
    latest.flush(HISTORY_FIXTURE);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('History sender');
  });
});
