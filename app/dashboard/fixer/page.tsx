import { Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FixerPage } from '@/components/dashboard/fixer/FixerPage';
import { Loader2 } from 'lucide-react';

function FixerFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );
}

export default function FixerRoute() {
  return (
    <DashboardLayout>
      <Suspense fallback={<FixerFallback />}>
        <FixerPage />
      </Suspense>
    </DashboardLayout>
  );
}
