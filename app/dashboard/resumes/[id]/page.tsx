import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import ResumeDetail from '@/components/dashboard/resumes/ResumeDetail';

export default function ResumeDetailRoute({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <ResumeDetail params={params} />
    </DashboardLayout>
  );
}
