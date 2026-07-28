import { Suspense } from 'react';
import ReportContent from './ReportContent';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading your detailed report...</p>
      </main>
    }>
      <ReportContent id={id} />
    </Suspense>
  );
}
