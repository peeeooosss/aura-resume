'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell, User, LogOut, ChevronDown, Search, Settings,
  Shield, Zap, Sparkles, Users, Award,
} from 'lucide-react';
import { usePlan } from '@/lib/hooks/usePlan';
import { cn } from '@/lib/utils/helpers';

export function Header() {
  const pathname = usePathname();
  const currentPlan = usePlan(s => s.currentPlan);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const planColors = {
    free: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    quick: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    pro: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    vip: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  };

  const planIcons = {
    free: Shield,
    quick: Zap,
    pro: Sparkles,
    vip: Award,
  };

  const PlanIcon = planIcons[currentPlan];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-slate-800">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 dark:text-slate-500" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search jobs, resumes, roadmaps... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-500 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800/50 transition-colors"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-surface-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-surface-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-semibold text-surface-900 dark:text-white">Notifications</h3>
                  <button className="text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white text-sm">Mark all read</button>
                </div>
                <div className="py-2">
                  <div className="px-4 py-3 text-surface-500 dark:text-slate-400 text-sm">No new notifications</div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-slate-800/50 transition-colors"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AS</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-surface-900 dark:text-white font-medium text-sm">Arjun Sharma</p>
                <p className="text-surface-500 dark:text-slate-500 text-xs capitalize">{currentPlan}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-surface-500 dark:text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-surface-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-surface-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold">AS</span>
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-white">Arjun Sharma</p>
                      <p className="text-surface-500 dark:text-slate-500 text-sm">arjun.sharma@email.com</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <PlanIcon className={cn('w-5 h-5', planColors[currentPlan].replace('bg-', 'text-').replace('border-', ''))} />
                    <span className="text-sm font-medium text-surface-900 dark:text-white capitalize">{currentPlan}</span>
                  </div>
                </div>
                <nav className="py-2" aria-label="User menu">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <Link
                    href="/plans"
                    className="flex items-center gap-3 px-4 py-2 text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Sparkles className="w-5 h-5" />
                    Plans & Billing
                  </Link>
                  <hr className="my-2 border-surface-200 dark:border-slate-800" />
                  <button
                    className="flex items-center gap-3 px-4 py-2 text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800/50 transition-colors w-full text-left"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </nav>
              </div>
            )}
          </div>

          <button
            onClick={() => setCommandOpen(true)}
            className="p-2 rounded-xl text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800/50 transition-colors md:hidden"
            aria-label="Command palette"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCommandOpen(false)} />
          <div className="relative w-full max-w-2xl mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-surface-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-surface-200 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-500" />
                <input
                  type="search"
                  placeholder="Search everything... (⌘K to close)"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-500 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 text-lg"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-surface-100 dark:bg-slate-800 text-surface-500 dark:text-slate-500 rounded">⌘K</kbd>
              </div>
            </div>
            <nav className="max-h-96 overflow-y-auto" aria-label="Command palette results">
              {[
                { label: 'Overview', href: '/dashboard', icon: '📊' },
                { label: 'My Resumes', href: '/dashboard/resumes', icon: '📄' },
                { label: 'Job Matches', href: '/dashboard/jobs/matches', icon: '🎯' },
                { label: 'Job Search', href: '/dashboard/jobs', icon: '🔍' },
                { label: '90-Day Roadmap', href: '/dashboard/roadmap', icon: '🗺️' },
                { label: 'Portfolio', href: '/dashboard/portfolio', icon: '🌐' },
                { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setCommandOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}