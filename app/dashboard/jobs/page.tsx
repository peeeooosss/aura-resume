import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { JobBrowserPage } from '@/components/dashboard/jobs/JobBrowserPage';

export default function JobsPageRoute() {
  return (
    <DashboardLayout>
      <JobBrowserPage />
    </DashboardLayout>
  );
}