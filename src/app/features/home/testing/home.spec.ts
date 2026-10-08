import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../../app';
import { routes } from '../../../app.routes';
import { DASHBOARD_COUNTS_FIXTURE, RECENT_PAYMENTS_FIXTURE } from './dashboard.fixtures';
import { PaymentFlowService } from '../../payments/services/payment-flow.service';
import { TEST_PAYMENT_ID } from '../../payments/testing/payment.fixtures';

describe('Home dashboard', () => {
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
  async function openHome(url = '/') {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    return fixture;
  }
  function flushDashboard(empty = false) {
    const requests = http.match((req) => req.url === '/api/payment-history');
    expect(requests.length).toBe(4);
    for (const request of requests) {
      const status = request.request.params.get('status');
      const count =
        status === 'PENDING'
          ? DASHBOARD_COUNTS_FIXTURE.pending
          : status === 'OK'
            ? DASHBOARD_COUNTS_FIXTURE.accepted
            : status === 'NOT_OK'
              ? DASHBOARD_COUNTS_FIXTURE.rejected
              : DASHBOARD_COUNTS_FIXTURE.total;
      expect(request.request.params.get('size')).toBe(status ? '1' : '5');
      request.flush({
        ...RECENT_PAYMENTS_FIXTURE,
        content: status || empty ? [] : RECENT_PAYMENTS_FIXTURE.content,
        totalElements: empty ? 0 : count,
      });
    }
  }
  it('opens the dashboard at the root and displays complete database counts', async () => {
    const fixture = await openHome();
    flushDashboard();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/home');
    const cards = Array.from(
      fixture.nativeElement.querySelectorAll('app-metric-card strong'),
    ) as HTMLElement[];
    expect(cards.map((card) => card.textContent?.trim())).toEqual(['21', '5', '7', '9']);
    expect(fixture.nativeElement.querySelector('app-stepper')).toBeNull();
    expect(fixture.nativeElement.querySelector('.recent-payment').getAttribute('href')).toBe(
      `/payments/${TEST_PAYMENT_ID}`,
    );
    expect(fixture.nativeElement.querySelector('.recent-payment').textContent).toContain(
      'History sender',
    );
    http.expectNone('/api/payments/upload');
  });
  it('offers a fresh payment even after an earlier submission', async () => {
    sessionStorage.setItem('ledger-submitted-id', JSON.stringify(TEST_PAYMENT_ID));
    const fixture = await openHome();
    flushDashboard();
    fixture.detectChanges();
    expect(TestBed.inject(PaymentFlowService).submittedPaymentId()).toBe(TEST_PAYMENT_ID);
    (fixture.nativeElement.querySelector('.welcome-actions button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/payments/new');
    expect(sessionStorage.getItem('ledger-submitted-id')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[name=debtorName]').value).toBe('');
  });
  it('shows an empty state and zero counts for a new database', async () => {
    const fixture = await openHome();
    flushDashboard(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Twoje pierwsze zlecenie czeka');
    expect(fixture.nativeElement.querySelectorAll('.recent-payment').length).toBe(0);
    expect(fixture.nativeElement.querySelector('app-metric-card strong').textContent.trim()).toBe(
      '0',
    );
  });
  it('shows unavailable data explicitly and allows retry', async () => {
    const fixture = await openHome();
    const requests = http.match((req) => req.url === '/api/payment-history');
    requests[0].flush({}, { status: 503, statusText: 'Service unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain(
      'Nie udało się pobrać danych pulpitu',
    );
    expect(fixture.nativeElement.querySelector('app-metric-card strong').textContent.trim()).toBe(
      '—',
    );
    (fixture.nativeElement.querySelector('.overview-heading button') as HTMLButtonElement).click();
    flushDashboard();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-metric-card strong').textContent.trim()).toBe(
      '21',
    );
  });
  it('redirects unknown routes to the dashboard', async () => {
    const fixture = await openHome('/unknown');
    flushDashboard();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/home');
  });
});
