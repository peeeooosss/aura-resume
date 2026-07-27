import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FixerPage } from '@/components/dashboard/fixer/FixerPage';

export default function FixerRoute() {
  return (
    <DashboardLayout>
      <FixerPage />
    </DashboardLayout>
  );
}