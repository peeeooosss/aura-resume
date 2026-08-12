'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCreditsStore } from './useCredits';

export function usePlanSync() {
  const { data: session, status } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    const sync = () => {
      if (status !== 'authenticated' || !session?.user?.id) return;
      useCreditsStore.getState().refresh();
    };

    if (status === 'authenticated' && session?.user?.id && !syncedRef.current) {
      syncedRef.current = true;
      sync();
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };
    const onFocus = () => sync();

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [status, session]);
}
