import { Component, DestroyRef, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { PanelComponent } from '../../../../shared/components/panel/panel.component';
import { ResultBannerComponent } from '../../components/result-banner/result-banner.component';
import { ValidationRowComponent } from '../../components/validation-row/validation-row.component';
import { PaymentFlowService } from '../../services/payment-flow.service';
import { PaymentTrackerService } from '../../services/payment-tracker.service';
@Component({
  selector: 'app-payment-result',
  imports: [
    JsonPipe,
    AlertComponent,
    PanelComponent,
    ResultBannerComponent,
    ValidationRowComponent,
  ],
  templateUrl: './payment-result.page.html',
  styleUrl: './payment-result.page.scss',
})
export class PaymentResultPage {
  protected readonly flow = inject(PaymentFlowService);
  protected readonly tracker = inject(PaymentTrackerService);
  protected readonly showTechnical = signal(false);
  constructor() {
    const destroyRef = inject(DestroyRef);
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed(destroyRef))
      .subscribe((params) => {
        const id = params.get('paymentId');
        if (id) {
          this.showTechnical.set(false);
          this.tracker.open(id);
        }
      });
    destroyRef.onDestroy(() => this.tracker.stop());
  }
}
