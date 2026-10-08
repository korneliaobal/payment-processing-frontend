import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeDashboardService } from '../../services/home-dashboard.service';
import { DASHBOARD_METRICS } from '../../config/dashboard.config';
import { PaymentFlowService } from '../../../payments/services/payment-flow.service';
import { PAYMENT_ROUTES } from '../../../payments/config/payment.config';
import { STATUS_PRESENTATION } from '../../../payments/config/payment-presentation';
import { PanelComponent } from '../../../../shared/components/panel/panel.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { MetricCardComponent } from '../../../../shared/components/metric-card/metric-card.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
@Component({
  selector: 'app-home',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    PanelComponent,
    AlertComponent,
    MetricCardComponent,
    StatusBadgeComponent,
  ],
  providers: [HomeDashboardService],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly dashboard = inject(HomeDashboardService);
  protected readonly flow = inject(PaymentFlowService);
  protected readonly routes = PAYMENT_ROUTES;
  protected readonly metrics = DASHBOARD_METRICS;
  protected readonly presentation = STATUS_PRESENTATION;
}
