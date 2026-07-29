import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TemplatesPage } from '@/components/dashboard/templates/TemplatesPage';

export default function TemplatesPageWrapper() {
  return (
    <DashboardLayout>
      <TemplatesPage />
    </DashboardLayout>
  );
}