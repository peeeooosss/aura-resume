'use client';

import { Children, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils/helpers';
import { usePlan } from '@/lib/hooks/usePlan';

interface PlanGateProps {
  children: ReactNode;
  requiredPlan?: 'free' | 'quick' | 'pro' | 'vip';
  feature?: string;
  fallback?: ReactNode;
  upgradeHref?: string;
}

const PLAN_TIER: Record<string, number> = { free: 0, quick: 1, pro: 2, vip: 3 };
const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  quick: 'Quick Fix',
  pro: 'Pro Bundle',
  vip: 'VIP Mentorship',
};

export function PlanGate({ children, requiredPlan = 'pro', feature, fallback, upgradeHref }: PlanGateProps) {
  const currentPlan = usePlan(s => s.currentPlan);

  const hasAccess = (PLAN_TIER[currentPlan] ?? 0) >= (PLAN_TIER[requiredPlan] ?? 0);

  if (hasAccess) {
    return <>{children}</>;
  }

  const planOrder = ['free', 'quick', 'pro', 'vip'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const requiredIndex = planOrder.indexOf(requiredPlan);
  const nextPlan = planOrder[Math.min(currentIndex + 1, planOrder.length - 1)];
  const targetPlan = requiredIndex > currentIndex ? nextPlan : requiredPlan;

  const defaultFallback = (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-surface-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">{feature || 'This feature'} is locked</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Upgrade to <span className="font-semibold text-surface-900 dark:text-white">{PLAN_NAMES[targetPlan]}</span> to unlock {feature?.toLowerCase() || 'this feature'} and more.
      </p>
      <a
        href={upgradeHref || `/plans?plan=${targetPlan}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
      >
        Upgrade to {PLAN_NAMES[targetPlan]}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>
  );

  return <>{fallback || defaultFallback}</>;
}