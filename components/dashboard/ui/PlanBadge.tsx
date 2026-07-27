'use client';

import { cn } from '@/lib/utils/helpers';
import type { PlanId } from '@/lib/constants/plans';
import { PLAN_DEFINITIONS, getPlanDefinition, canAccessFeature } from '@/lib/constants/plans';
import { Shield, Zap, Sparkles, Users, Award } from 'lucide-react';

interface PlanBadgeProps {
  planId: PlanId;
  variant?: 'default' | 'compact' | 'pill' | 'detailed';
  showUpgrade?: boolean;
  onUpgradeClick?: () => void;
}

const PlanIcons = {
  free: Shield,
  quick: Zap,
  pro: Sparkles,
  vip: Users,
  vip_mentorship: Award,
} as const;

const PlanNames: Record<string, string> = {
  free: 'Free',
  quick: 'Quick Fix',
  pro: 'Pro Bundle',
  vip: 'VIP Mentorship',
};

export function PlanBadge({ planId, variant = 'default', showUpgrade = false, onUpgradeClick }: PlanBadgeProps) {
  const plan = getPlanDefinition(planId);
  const Icon = PlanIcons[planId];

  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold transition-all';

  const variantStyles = {
    default: 'px-3 py-1.5 rounded-xl border',
    compact: 'px-2.5 py-1 rounded-lg',
    pill: 'px-3 py-1 rounded-full',
    detailed: 'px-4 py-3 rounded-2xl border-2',
  };

  const colorStyles = {
    free: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    quick: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pro: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    vip: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  if (variant === 'compact') {
    return (
      <span className={cn(baseStyles, variantStyles.compact, colorStyles[planId])}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{PlanNames[planId]}</span>
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span className={cn(baseStyles, variantStyles.pill, colorStyles[planId])}>
        <Icon className="w-3.5 h-3.5" />
        {PlanNames[planId]}
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex flex-col gap-1', variantStyles.detailed, colorStyles[planId])}>
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', colorStyles[planId].replace('bg-', 'bg-').replace('border-', 'border-'))}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">{PlanNames[planId]}</p>
            <p className="text-xs opacity-80">₹{plan.price}{plan.period !== 'one-time' ? ` / ${plan.period}` : ''}</p>
          </div>
        </div>
        <ul className="space-y-1 pl-10">
          {plan.features.slice(0, 3).map((f, i) => (
            <li key={i} className="text-xs flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              {f}
            </li>
          ))}
        </ul>
        {showUpgrade && (
          <button
            onClick={onUpgradeClick}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            Upgrade to {PlanNames[planId === 'free' ? 'quick' : planId === 'quick' ? 'pro' : 'vip']}
          </button>
        )}
      </div>
    );
  }

  return (
    <span className={cn(baseStyles, variantStyles.default, colorStyles[planId])}>
      <Icon className="w-4 h-4" />
      {PlanNames[planId]}
    </span>
  );
}