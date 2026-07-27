import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { JobSearchPage } from '@/components/dashboard/jobs/JobSearchPage';

export default function JobsPageRoute() {
  return (
    <DashboardLayout>
      <JobSearchPage />
    </DashboardLayout>
  );
}