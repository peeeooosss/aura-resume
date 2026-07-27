import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RoadmapOverview } from '@/components/dashboard/roadmap/RoadmapOverview';

export default function RoadmapPage() {
  return (
    <DashboardLayout>
      <RoadmapOverview />
    </DashboardLayout>
  );
}
