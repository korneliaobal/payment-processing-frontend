import type { Dashboard } from './dashboard.model';
import type { MetricTone } from '../../../shared/models/metric-tone.model';
export interface DashboardMetric {
  key: keyof Dashboard['counts'];
  label: string;
  description: string;
  tone: MetricTone;
}
