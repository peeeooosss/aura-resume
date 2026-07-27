'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanId } from '@/lib/constants/plans';

interface PlanState {
  currentPlan: PlanId;
  usage: {
    resumes: number;
    scansThisMonth: number;
    jobMatches: number;
    tailoredResumes: number;
    roadmaps: number;
  };
  setPlan: (plan: PlanId) => void;
  incrementUsage: (key: keyof PlanState['usage']) => void;
  resetMonthlyUsage: () => void;
  canAccess: (feature: keyof PlanState['usage']) => boolean;
  getUsagePercent: (feature: keyof PlanState['usage']) => number;
}

export const usePlan = create<PlanState>()(
  persist(
    (set, get) => ({
      currentPlan: 'pro',
      usage: {
        resumes: 3,
        scansThisMonth: 12,
        jobMatches: 8,
        tailoredResumes: 2,
        roadmaps: 1,
      },
      setPlan: (plan) => set({ currentPlan: plan }),
      incrementUsage: (key) => set((state) => ({
        usage: { ...state.usage, [key]: state.usage[key] + 1 },
      })),
      resetMonthlyUsage: () => set((state) => ({
        usage: { ...state.usage, scansThisMonth: 0 },
      })),
      canAccess: (feature) => {
        const plan = get().currentPlan;
        const limits: Record<PlanId, Record<string, number>> = {
          free: { resumes: 1, scansThisMonth: 1, jobMatches: 5, tailoredResumes: 0, roadmaps: 0 },
          quick: { resumes: 3, scansThisMonth: 999, jobMatches: 20, tailoredResumes: 0, roadmaps: 1 },
          pro: { resumes: 999, scansThisMonth: 999, jobMatches: 100, tailoredResumes: 5, roadmaps: 3 },
          vip: { resumes: 999, scansThisMonth: 999, jobMatches: 999, tailoredResumes: 999, roadmaps: 999 },
        };
        const limit = limits[plan][feature] ?? 0;
        const usage = get().usage[feature] ?? 0;
        return limit === 999 || usage < limit;
      },
      getUsagePercent: (feature) => {
        const plan = get().currentPlan;
        const limits: Record<PlanId, Record<string, number>> = {
          free: { resumes: 1, scansThisMonth: 1, jobMatches: 5, tailoredResumes: 0, roadmaps: 0 },
          quick: { resumes: 3, scansThisMonth: 20, jobMatches: 20, tailoredResumes: 0, roadmaps: 1 },
          pro: { resumes: 20, scansThisMonth: 100, jobMatches: 100, tailoredResumes: 5, roadmaps: 3 },
          vip: { resumes: 50, scansThisMonth: 200, jobMatches: 200, tailoredResumes: 20, roadmaps: 10 },
        };
        const limit = limits[plan][feature] ?? 1;
        const usage = get().usage[feature] ?? 0;
        if (limit === 0) return 100;
        return Math.min(100, Math.round((usage / limit) * 100));
      },
    }),
    {
      name: 'aura-plan-storage',
      partialize: (state) => ({ currentPlan: state.currentPlan, usage: state.usage }),
    }
  )
);