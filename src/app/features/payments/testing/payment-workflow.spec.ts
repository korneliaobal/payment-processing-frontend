import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from '../../../app';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../../app.routes';
import type { PaymentInput } from '../models/payment-input.model';
import {
  DIRECT_PAYMENT_ID,
  DIRECT_PAYMENT_STATUS_FIXTURE,
  UPLOAD_ERROR_FIXTURE,
  PAYMENT_RESPONSE_FIXTURE,
  REJECTED_STATUS_FIXTURE,
  TEST_PAYMENT_ID,
} from './payment.fixtures';

import { SAVED_DRAFT_FIXTURE } from './draft.fixtures';

describe('Payment workspace', () => {
  let http: HttpTestingController;
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  async function createWorkspace() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/payments/new');
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  async function reviewExample() {
    const fixture = await createWorkspace();
    (
      fixture.nativeElement.querySelector('.panel-header .text-button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('form .primary') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/payments/review');
    return fixture;
  }

  it('requires sender and recipient data before review', async () => {
    const fixture = await createWorkspace();
    (fixture.nativeElement.querySelector('form .primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    http.expectNone('/api/payments/upload');
  });

  it('blocks a correctly sized account with an invalid checksum', async () => {
    const fixture = await createWorkspace();
    (
      fixture.nativeElement.querySelector('.panel-header .text-button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    await fixture.whenStable();
    const account = fixture.nativeElement.querySelector(
      'input[name="debtorAccount"]',
    ) as HTMLInputElement;
    account.value = 'PL62109010140000071219812874';
    account.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('form .primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/payments/new');
    expect(fixture.nativeElement.querySelector('#debtor-account-error').textContent).toContain(
      'sumę kontrolną',
    );
    http.expectNone('/api/payments/upload');
  });

  it('creates a JSON file with correct totals and displays the real final status', async () => {
    const fixture = await reviewExample();
    expect(fixture.nativeElement.textContent).toContain('Sprawdź dane zlecenia');
    (fixture.nativeElement.querySelector('.summary .primary') as HTMLButtonElement).click();
    const upload = http.expectOne('/api/payments/upload');
    expect(upload.request.method).toBe('POST');
    const file = (upload.request.body as FormData).get('file') as File;
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
    const payload: PaymentInput = JSON.parse(content);
    expect(payload.transactionCount).toBe(2);
    expect(payload.totalAmount).toBe(2090.5);
    expect(payload.transactions.map((row) => row.amount)).toEqual([1250, 840.5]);
    upload.flush(PAYMENT_RESPONSE_FIXTURE);
    await vi.waitFor(() => {
      fixture.detectChanges();
      http.expectOne(`/api/payment-status/${TEST_PAYMENT_ID}`).flush(REJECTED_STATUS_FIXTURE);
    });
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe(`/payments/${TEST_PAYMENT_ID}`);
    expect(fixture.nativeElement.textContent).toContain('Płatność została odrzucona');
    expect(fixture.nativeElement.textContent).toContain('Kwota transakcji musi być większa niż 5');
    expect(fixture.nativeElement.querySelectorAll('.badge[data-tone="danger"]').length).toBe(1);
    fixture.destroy();
  });

  it('shows the backend error and keeps the review available for retry', async () => {
    const fixture = await reviewExample();
    (fixture.nativeElement.querySelector('.summary .primary') as HTMLButtonElement).click();
    http
      .expectOne('/api/payments/upload')
      .flush(UPLOAD_ERROR_FIXTURE, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Total amount does not match',
    );
    expect(fixture.nativeElement.querySelector('.summary .primary').disabled).toBe(false);
  });
  it('redirects a review URL without a valid draft to the form', async () => {
    const fixture = await createWorkspace();
    await TestBed.inject(Router).navigateByUrl('/payments/review');
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/payments/new');
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('restores a saved draft on a direct review URL', async () => {
    sessionStorage.setItem('obalflow-draft', JSON.stringify(SAVED_DRAFT_FIXTURE));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/payments/review');
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/payments/review');
    expect(fixture.nativeElement.textContent).toContain('Saved sender');
    expect(fixture.nativeElement.textContent).toContain('Saved recipient');
  });

  it('reads a payment status from a direct URL without uploading again', async () => {
    const fixture = await createWorkspace();
    await TestBed.inject(Router).navigateByUrl(`/payments/${DIRECT_PAYMENT_ID}`);
    await vi.waitFor(() => {
      fixture.detectChanges();
      http
        .expectOne(`/api/payment-status/${DIRECT_PAYMENT_ID}`)
        .flush(DIRECT_PAYMENT_STATUS_FIXTURE);
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Płatność przeszła walidację');
    expect(fixture.nativeElement.textContent).toContain('Transakcja 1');
    http.expectNone('/api/payments/upload');
    fixture.destroy();
  });
});
