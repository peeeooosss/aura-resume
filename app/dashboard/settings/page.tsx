import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SettingsPage } from '@/components/dashboard/settings/SettingsPage';

export default function SettingsRoute() {
  return (
    <DashboardLayout>
      <SettingsPage />
    </DashboardLayout>
  );
}
