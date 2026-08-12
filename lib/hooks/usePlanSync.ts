'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePlan } from './usePlan';
import { useCreditsStore } from './useCredits';

export function usePlanSync() {
  const { data: session, status } = useSession();
  const { setPlan, currentPlan } = usePlan();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id || syncedRef.current) return;

    (async () => {
      try {
        const res = await fetch('/api/credits');
        const data = await res.json();
        if (res.ok) {
          if (data.plan && data.plan !== currentPlan) {
            setPlan(data.plan);
          }
          if (typeof data.balance === 'number') {
            useCreditsStore.setState({ balance: data.balance, loading: false });
          }
        }
      } catch (err) {
        console.error('Failed to sync plan/credits:', err);
      } finally {
        syncedRef.current = true;
      }
    })();
  }, [status, session, currentPlan, setPlan]);
}
