import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnalyserPage } from '@/components/dashboard/analyser/AnalyserPage';

export default function AnalyserRoute() {
  return (
    <DashboardLayout>
      <AnalyserPage />
    </DashboardLayout>
  );
}