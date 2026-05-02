"use client";

import { DashboardPage as PremiumDashboard } from '@/features/finance/components/dashboard/DashboardPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <PremiumDashboard />;
}
