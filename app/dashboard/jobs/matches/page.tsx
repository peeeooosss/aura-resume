import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { JobMatchesPage } from '@/components/dashboard/jobs/JobMatchesPage';

export default function JobMatchesPageRoute() {
  return (
    <DashboardLayout>
      <JobMatchesPage />
    </DashboardLayout>
  );
}