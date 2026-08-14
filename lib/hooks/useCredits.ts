'use client';

import { create } from 'zustand';
import { useEffect, useCallback } from 'react';
import { usePlan } from './usePlan';

interface CreditsState {
  balance: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

async function fetchUserState() {
  try {
    const res = await fetch('/api/credits');
    const data = await res.json();
    if (res.ok) {
      return { balance: data.balance ?? 0, plan: data.plan as string | undefined };
    }
    return { balance: 0, plan: undefined };
  } catch (err) {
    console.error('Failed to fetch credits:', err);
    return { balance: 0, plan: undefined };
  }
}

const useCreditsStore = create<CreditsState>((set) => ({
  balance: 0,
  loading: true,
  refresh: async () => {
    set({ loading: true });
    const { balance, plan } = await fetchUserState();
    // Dashboard only recognizes free/pro/vip; map 'quick' to 'free' since
    // Quick Fix is a landing-page-only purchase not tracked in the dashboard.
    if (plan && (plan === 'free' || plan === 'pro' || plan === 'vip')) {
      if (plan !== usePlan.getState().currentPlan) {
        usePlan.getState().setPlan(plan as 'free' | 'pro' | 'vip');
      }
    }
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
