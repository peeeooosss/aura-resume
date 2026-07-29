'use client';

import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const ResumeJobCompare = dynamic(
  () => import('@/components/dashboard/jobs/ResumeJobCompare'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center py-20">
      <p className="text-surface-400 dark:text-slate-500">Loading...</p>
    </div>
  )}
);

export default function ComparePage() {
  return (
    <DashboardLayout>
      <ResumeJobCompare />
    </DashboardLayout>
  );
}
