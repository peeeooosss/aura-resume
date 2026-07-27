import { Suspense } from 'react';
import ResultsContent from './ResultsContent';

export default async function ResultsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading your analysis...</p>
      </main>
    }>
      <ResultsContent id={params.id} testMode={params.test === 'true'} />
    </Suspense>
  );
}
