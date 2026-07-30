'use client';

import { SessionProvider } from 'next-auth/react';
import { usePlanSync } from '@/lib/hooks/usePlanSync';

function PlanSyncWrapper({ children }: { children: React.ReactNode }) {
  usePlanSync();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PlanSyncWrapper>{children}</PlanSyncWrapper>
    </SessionProvider>
  );
}
