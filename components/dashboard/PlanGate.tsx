'use client';

import { Shield, Zap, Sparkles, Award, Lock, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { usePlan } from '@/lib/hooks/usePlan';
import { PLAN_DEFINITIONS } from '@/lib/constants/plans';
import Link from 'next/link';

interface PlanGateProps {
  children: React.ReactNode;
  requiredPlan?: 'free' | 'quick' | 'pro' | 'vip';
  featureName?: string;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  upgradeHref?: string;
}

const planIcons = {
  free: Shield,
  quick: Zap,
  pro: Sparkles,
  vip: Award,
};

const planLabels = {
  free: 'Free',
  quick: 'Quick Fix',
  pro: 'Pro Bundle',
  vip: 'VIP Mentorship',
};

const PLAN_TIER: Record<string, number> = { free: 0, quick: 1, pro: 2, vip: 3 };

export function PlanGate({
  children,
  requiredPlan = 'pro',
  featureName,
  fallback,
  showUpgrade = true,
  upgradeHref,
}: PlanGateProps) {
  const currentPlan = usePlan(s => s.currentPlan);
  const hasAccess = (PLAN_TIER[currentPlan] ?? 0) >= (PLAN_TIER[requiredPlan] ?? 0);
  const requiredPlanDef = PLAN_DEFINITIONS[requiredPlan];
  const currentPlanDef = PLAN_DEFINITIONS[currentPlan];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const RequiredPlanIcon = planIcons[requiredPlan];
  const CurrentPlanIcon = planIcons[currentPlan];

  const targetHref = upgradeHref || `/plans?plan=${requiredPlan}`;

  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
        <RequiredPlanIcon className="w-8 h-8 text-surface-900 dark:text-white" />
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-white mb-3">
        {featureName ? `"${featureName}" requires ${planLabels[requiredPlan]}` : `${planLabels[requiredPlan]} feature`}
      </h3>

      <p className="text-surface-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
        You're on the <span className="font-semibold text-surface-900 dark:text-white">{planLabels[currentPlan]}</span> plan. 
        Upgrade to <span className="font-semibold text-surface-900 dark:text-white">{planLabels[requiredPlan]}</span> to unlock this feature.
      </p>

      {showUpgrade && (
        <div className="space-y-4">
          <Link
            href={targetHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <RequiredPlanIcon className="w-5 h-5" />
            Upgrade to {planLabels[requiredPlan]}
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-surface-400 dark:text-slate-500 text-sm">
            {currentPlan === 'free' 
              ? 'Start with Quick Fix (₹49) for instant access, or unlock all Pro features.'
              : currentPlan === 'quick'
              ? 'Upgrade to Pro (₹499/3mo) for unlimited tailored resumes, job matches, and roadmaps.'
              : 'Upgrade to VIP (₹1,499/3mo) for unlimited everything plus 1-on-1 mentoring.'}
          </p>
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-surface-200 dark:border-slate-800">
        <h4 className="text-sm font-medium text-surface-400 dark:text-slate-500 mb-4">Plan Comparison</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {(['free', 'quick', 'pro', 'vip'] as const).map((plan) => {
            const def = PLAN_DEFINITIONS[plan];
            const Icon = planIcons[plan];
            return (
              <div key={plan} className={cn(
                'p-4 rounded-2xl border transition-colors',
                plan === requiredPlan 
                  ? 'bg-indigo-500/10 border-indigo-500/30 ring-2 ring-indigo-500/20'
                  : plan === currentPlan
                  ? 'bg-surface-100 dark:bg-slate-800/50 border-surface-300 dark:border-slate-700'
                  : 'bg-slate-900/50 border-surface-200 dark:border-slate-800 hover:border-surface-300 dark:border-slate-700'
              )}>
                <div className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                  <Shield className="w-4 h-4 text-surface-900 dark:text-white" />
                </div>
                <span className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider">
                  {plan === 'free' ? 'FREE' : plan === 'quick' ? '₹49' : plan === 'pro' ? '₹499' : '₹1,499'}
                </span>
                <span className="text-xs text-surface-400 dark:text-slate-500 block mt-1">{planLabels[plan]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function FeatureLock({
  featureName,
  requiredPlan = 'pro',
  description,
}: {
  featureName: string;
  requiredPlan?: 'free' | 'quick' | 'pro' | 'vip';
  description?: string;
}) {
  const currentPlan = usePlan(s => s.currentPlan);
  const hasAccess = (PLAN_TIER[currentPlan] ?? 0) >= (PLAN_TIER[requiredPlan] ?? 0);

  if (hasAccess) return null;

  return (
    <div className="relative bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-2xl" />
      <div className="relative z-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-surface-900 dark:text-white" />
        </div>
        <h4 className="font-semibold text-surface-900 dark:text-white mb-2">{featureName}</h4>
        <p className="text-surface-500 dark:text-slate-400 text-sm mb-4 max-w-xs mx-auto">
          {description || `This feature requires ${PLAN_DEFINITIONS[requiredPlan].name} plan or higher.`}
        </p>
        <button
          onClick={() => window.location.href = `/plans?plan=${requiredPlan}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          Upgrade to {PLAN_DEFINITIONS[requiredPlan].name}
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}