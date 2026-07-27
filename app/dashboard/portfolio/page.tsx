import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PortfolioBuilder } from '@/components/dashboard/portfolio/PortfolioBuilder';

export default function PortfolioPage() {
  return (
    <DashboardLayout>
      <PortfolioBuilder />
    </DashboardLayout>
  );
}
