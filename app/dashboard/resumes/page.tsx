import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ResumesPage } from '@/components/dashboard/resumes/ResumesPage';

export default function ResumesPageRoute() {
  return (
    <DashboardLayout>
      <ResumesPage />
    </DashboardLayout>
  );
}