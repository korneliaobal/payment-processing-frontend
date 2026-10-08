import type { Dashboard } from '../models/dashboard.model';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { createAsyncResource } from '../../../core/state/async-resource';
import { PaymentApiService } from '../../payments/services/payment-api.service';
import { DASHBOARD_MESSAGES, DASHBOARD_RECENT_LIMIT } from '../config/dashboard.config';
import { toDashboard } from '../utils/dashboard.mapper';

@Injectable()
export class HomeDashboardService {
  private readonly api = inject(PaymentApiService);
  private readonly resource = createAsyncResource<Dashboard, void>(
    () =>
      forkJoin({
        recent: this.api.getHistory({ size: DASHBOARD_RECENT_LIMIT }),
        pending: this.api.getHistory({ status: 'PENDING', size: 1 }),
        accepted: this.api.getHistory({ status: 'OK', size: 1 }),
        rejected: this.api.getHistory({ status: 'NOT_OK', size: 1 }),
      }).pipe(map(toDashboard)),
    DASHBOARD_MESSAGES.unavailable,
  );
  readonly data = this.resource.data;
  readonly loading = this.resource.loading;
  readonly error = this.resource.error;
  readonly updatedAt = this.resource.updatedAt;
  constructor() {
    this.refresh();
  }
  refresh(): void {
    this.resource.load(undefined);
  }
}
