import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobDetailPage from '@/components/dashboard/jobs/JobDetailPage';

export default function JobDetailPageRoute({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <JobDetailPage params={params} />
    </DashboardLayout>
  );
}