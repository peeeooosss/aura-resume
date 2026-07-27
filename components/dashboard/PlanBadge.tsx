'use client';

import { Shield, Zap, Sparkles, Award } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface PlanBadgeProps {
  plan?: 'free' | 'quick' | 'pro' | 'vip';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'default' | 'outline' | 'dot';
}

const planStyles = {
  free: {
    icon: Shield,
    colors: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    dotColor: 'bg-slate-400',
    label: 'Free',
  },
  quick: {
    icon: Zap,
    colors: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    label: 'Quick Fix',
  },
  pro: {
    icon: Sparkles,
    colors: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    dotColor: 'bg-indigo-400',
    label: 'Pro',
  },
  vip: {
    icon: Award,
    colors: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-400',
    label: 'VIP',
  },
};

const sizeStyles = {
  sm: { px: 'px-2 py-0.5', text: 'text-xs', icon: 'w-3 h-3', gap: 'gap-1' },
  md: { px: 'px-2.5 py-1', text: 'text-sm', icon: 'w-4 h-4', gap: 'gap-1.5' },
  lg: { px: 'px-3 py-1.5', text: 'text-base', icon: 'w-5 h-5', gap: 'gap-2' },
};

export function PlanBadge({ plan = 'pro', size = 'md', showLabel = true, variant = 'default' }: PlanBadgeProps) {
  const style = planStyles[plan];
  const sizes = sizeStyles[size];
  const Icon = style.icon;

  if (variant === 'dot') {
    return (
      <span className={cn('inline-flex items-center', sizes.gap)} aria-label={style.label}>
        <span className={cn('rounded-full', style.dotColor, 'w-2 h-2', size === 'sm' && 'w-1.5 h-1.5', size === 'lg' && 'w-2.5 h-2.5')} />
        {showLabel && <span className="text-xs font-medium text-slate-300">{style.label}</span>}
      </span>
    );
  }

  if (variant === 'outline') {
    return (
      <span className={cn('inline-flex items-center', sizes.gap, 'border', 'border-slate-700', 'rounded-full')}>
        <Icon className={cn(sizes.icon, style.colors.replace('bg-', 'text-').replace('border-', ''))} aria-hidden="true" />
        {showLabel && <span className={cn(sizes.text, 'font-medium', style.colors.replace('bg-', 'text-').replace('border-', ''))}>{style.label}</span>}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center', sizes.gap, 'rounded-full border', style.colors, sizes.px)}>
      <Icon className={cn(sizes.icon, style.colors.replace('bg-', 'text-').replace('border-', ''))} aria-hidden="true" />
      {showLabel && <span className={cn(sizes.text, 'font-semibold')}>{style.label}</span>}
    </span>
  );
}