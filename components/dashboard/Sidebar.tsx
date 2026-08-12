'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Target, Search, Map, Globe,
  Settings, ChevronLeft, ChevronRight, Menu, X,
  Bell, User, LogOut, Shield, Zap, Sparkles, Award, Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { usePlan } from '@/lib/hooks/usePlan';
import { useCredits } from '@/lib/hooks/useCredits';
import { NAV_ITEMS } from '@/lib/constants/nav';
import { REFILL_THRESHOLD } from '@/lib/constants/credits';
import { PlanBadge } from './PlanBadge';
import { CreditRefillModal } from './CreditRefillModal';

const PLAN_TIER: Record<string, number> = { free: 0, quick: 1, pro: 2, vip: 3 };

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refillOpen, setRefillOpen] = useState(false);
  const pathname = usePathname();
  const currentPlan = usePlan(s => s.currentPlan);
  const { balance } = useCredits();

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface-100 dark:bg-slate-900/80 backdrop-blur-xl border border-surface-200 dark:border-slate-700 rounded-xl text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:hover:text-surface-900 dark:text-white transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 bg-surface-50 dark:bg-slate-950/90 backdrop-blur-xl border-r border-surface-200 dark:border-slate-800 transition-all duration-300 ease-out flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-surface-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="Aura Resume Dashboard">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-surface-900 dark:text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-surface-900 dark:text-surface-900 dark:text-white text-lg">Aura</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-1.5 rounded-lg text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors',
              collapsed && 'lg:hidden'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((section) => (
            <div key={section.title} className={cn(!collapsed && 'mb-6')}>
              {!collapsed && (
                <h3 className="px-3 py-1 text-xs font-semibold text-surface-500 dark:text-slate-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-0.5" role="list">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      const hasAccess = item.plan === 'free' || (PLAN_TIER[currentPlan] ?? 0) >= (PLAN_TIER[item.plan] ?? 0);
                  const ItemIcon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-primary-600/10 to-purple-600/10 text-primary-600 dark:text-primary-400'
                            : 'text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800/50',
                          !hasAccess && 'opacity-50 cursor-not-allowed',
                          collapsed && 'justify-center px-0'
                        )}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-disabled={!hasAccess}
                        title={collapsed ? item.label : undefined}
                      >
                        <ItemIcon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-400')} aria-hidden="true" />
                        {!collapsed && (
                          <>
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            {!hasAccess && (
                              <Shield className="w-3.5 h-3.5 ml-auto text-amber-400/80" aria-hidden="true" />
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-200 dark:border-slate-800">
          <div className="relative">
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-100 dark:bg-slate-900/50 border border-surface-200 dark:border-slate-800',
              collapsed && 'justify-center px-0'
            )}>
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                currentPlan === 'pro' ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700' :
                currentPlan === 'vip' ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700' :
                currentPlan === 'quick' ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700' :
                'bg-surface-200 dark:bg-slate-700/50 border border-surface-300 dark:border-slate-600'
              )}>
                {currentPlan === 'pro' && <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                {currentPlan === 'vip' && <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                {currentPlan === 'quick' && <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                {currentPlan === 'free' && <Shield className="w-4 h-4 text-surface-500 dark:text-slate-400" />}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-surface-500 dark:text-slate-500 truncate">Current Plan</p>
                  <p className="font-semibold text-surface-900 dark:text-surface-900 dark:text-white truncate capitalize">
                    {currentPlan === 'free' ? 'Free' :
                     currentPlan === 'quick' ? 'Quick Fix' :
                     currentPlan === 'pro' ? 'Pro Bundle' : 'VIP Mentorship'}
                  </p>
                </div>
              )}
                        <Link
                          href="/plans"
                          className={cn(
                            'p-1.5 rounded-lg text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors',
                            collapsed && 'mx-auto'
                          )}
                          onClick={() => setMobileOpen(false)}
                          aria-label="Upgrade plan"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
            </div>
            {!collapsed && (
              <div className="mt-2 px-3 py-2.5 rounded-xl bg-surface-100 dark:bg-slate-900/50 border border-surface-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className={cn('w-4 h-4', balance <= REFILL_THRESHOLD ? 'text-rose-400' : 'text-amber-400')} />
                    <span className="text-xs text-surface-500 dark:text-slate-500">Credits</span>
                  </div>
                  <span className={cn('font-bold text-sm', balance <= REFILL_THRESHOLD ? 'text-rose-500' : 'text-surface-900 dark:text-white')}>
                    {balance}
                  </span>
                </div>
                <button
                  onClick={() => setRefillOpen(true)}
                  className="mt-2 w-full text-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
                >
                  {balance <= REFILL_THRESHOLD ? 'Low — Refill Now' : 'Refill Credits'}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <CreditRefillModal open={refillOpen} onClose={() => setRefillOpen(false)} plan={currentPlan} />
    </>
  );
}