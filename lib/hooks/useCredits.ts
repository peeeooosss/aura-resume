'use client';

import { create } from 'zustand';
import { useEffect, useCallback } from 'react';
import { usePlan } from './usePlan';
import type { PlanId } from '@/lib/constants/plans';

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
      return { balance: data.balance ?? 0, plan: data.plan as PlanId | undefined };
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
    if (plan && plan !== usePlan.getState().currentPlan) {
      usePlan.getState().setPlan(plan);
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
