import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PortfolioBuilder } from '@/components/dashboard/portfolio/PortfolioBuilder';
import { PlanGate } from '@/components/dashboard/PlanGate';

export default function PortfolioPage() {
  return (
    <DashboardLayout>
      <PlanGate requiredPlan="vip" featureName="Portfolio Builder">
        <PortfolioBuilder />
      </PlanGate>
    </DashboardLayout>
  );
}
