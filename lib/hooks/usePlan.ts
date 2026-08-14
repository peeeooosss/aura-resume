'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLAN_DEFINITIONS } from '@/lib/constants/plans';

type DashboardPlanId = 'free' | 'pro' | 'vip';

interface PlanState {
  currentPlan: DashboardPlanId;
  usage: {
    resumes: number;
    scansThisMonth: number;
    jobMatches: number;
    tailoredResumes: number;
    roadmaps: number;
  };
  setPlan: (plan: DashboardPlanId) => void;
  setUsage: (usage: Partial<PlanState['usage']>) => void;
  incrementUsage: (key: keyof PlanState['usage']) => void;
  resetMonthlyUsage: () => void;
  canAccess: (feature: keyof PlanState['usage']) => boolean;
  getUsagePercent: (feature: keyof PlanState['usage']) => number;
}

function getPlanLimit(plan: DashboardPlanId, key: string): number {
  const def = PLAN_DEFINITIONS[plan] || PLAN_DEFINITIONS.free;
  const limitsMap: Record<string, number> = {
    resumes: def.limits.resumes,
    scansThisMonth: def.limits.scansPerMonth,
    jobMatches: def.limits.jobMatches,
    tailoredResumes: def.limits.tailoredResumes,
    roadmaps: def.limits.roadmaps,
  };
  return limitsMap[key] ?? 0;
}

export const usePlan = create<PlanState>()(
  persist(
    (set, get) => ({
      currentPlan: 'free',
      usage: {
        resumes: 0,
        scansThisMonth: 0,
        jobMatches: 0,
        tailoredResumes: 0,
        roadmaps: 0,
      },
      setPlan: (plan) => set({ currentPlan: plan as DashboardPlanId }),
      setUsage: (usage) => set((state) => ({ usage: { ...state.usage, ...usage } })),
      incrementUsage: (key) => set((state) => ({
        usage: { ...state.usage, [key]: state.usage[key] + 1 },
      })),
      resetMonthlyUsage: () => set((state) => ({
        usage: { ...state.usage, scansThisMonth: 0 },
      })),
      canAccess: (feature) => {
        const plan = get().currentPlan;
        const limit = getPlanLimit(plan, feature);
        const used = get().usage[feature] ?? 0;
        return limit === 999 || used < limit;
      },
      getUsagePercent: (feature) => {
        const plan = get().currentPlan;
        const limit = getPlanLimit(plan, feature);
        const used = get().usage[feature] ?? 0;
        if (limit === 0) return 100;
        if (limit === 999) return Math.min(100, used * 2);
        return Math.min(100, Math.round((used / limit) * 100));
      },
    }),
    {
      name: 'aura-plan-storage',
      partialize: (state) => ({ currentPlan: state.currentPlan, usage: state.usage }),
    }
  )
);
