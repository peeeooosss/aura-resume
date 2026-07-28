import { Suspense } from 'react';
import PlansContent from './PlansContent';

export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-surface-900 dark:text-white">Loading plans...</p>
      </div>
    }>
      <PlansContent />
    </Suspense>
  );
}