'use client';

import { create } from 'zustand';
import { useEffect, useCallback } from 'react';

interface CreditsState {
  balance: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

async function fetchBalance() {
  try {
    const res = await fetch('/api/credits');
    const data = await res.json();
    if (res.ok) {
      return data.balance ?? 0;
    }
    return 0;
  } catch (err) {
    console.error('Failed to fetch credits:', err);
    return 0;
  }
}

const useCreditsStore = create<CreditsState>((set) => ({
  balance: 0,
  loading: true,
  refresh: async () => {
    set({ loading: true });
    const balance = await fetchBalance();
    set({ balance, loading: false });
  },
}));

export { useCreditsStore };

let initialized = false;

export function useCredits() {
  const balance = useCreditsStore((s) => s.balance);
  const loading = useCreditsStore((s) => s.loading);
  const storeRefresh = useCreditsStore((s) => s.refresh);

  const refresh = useCallback(() => storeRefresh(), [storeRefresh]);

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      storeRefresh();
    }
  }, [storeRefresh]);

  return { balance, loading, refresh };
}
