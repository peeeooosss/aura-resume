'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PlanGate } from '@/components/dashboard/PlanGate';
import { ColdEmailPage } from '@/components/dashboard/emails/ColdEmailPage';

export default function EmailsPage() {
  return (
    <DashboardLayout>
      <PlanGate requiredPlan="vip" featureName="Cold Emails" upgradeHref="/plans?plan=vip">
        <ColdEmailPage />
      </PlanGate>
    </DashboardLayout>
  );
}
