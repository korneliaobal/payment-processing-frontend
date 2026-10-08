import type { Dashboard } from '../models/dashboard.model';
import type { DashboardHistory } from '../models/dashboard-history.model';
export function toDashboard({ recent, pending, accepted, rejected }: DashboardHistory): Dashboard {
  return {
    counts: {
      total: recent.totalElements,
      pending: pending.totalElements,
      accepted: accepted.totalElements,
      rejected: rejected.totalElements,
    },
    recentPayments: recent.content,
  };
}
