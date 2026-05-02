"use client";

import { MetricCard } from './MetricCard';
import { DashboardMetric } from '../../types/dashboard.types';

interface Props {
  metrics: DashboardMetric[];
}

export function MetricsGrid({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}
