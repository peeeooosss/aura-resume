'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePlan } from './usePlan';

export function usePlanSync() {
  const { data: session, status } = useSession();
  const { setPlan, currentPlan } = usePlan();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.plan || syncedRef.current) return;

    const serverPlan = session.user.plan;
    if (serverPlan && serverPlan !== currentPlan) {
      setPlan(serverPlan as any);
    }
    syncedRef.current = true;
  }, [status, session, currentPlan, setPlan]);
}
