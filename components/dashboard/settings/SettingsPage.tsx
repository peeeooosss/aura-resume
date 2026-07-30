'use client';

import { useState } from 'react';
import { usePlan } from '@/lib/hooks/usePlan';
import { useResumes } from '@/lib/hooks/useResumes';
import { useAuth } from '@/lib/hooks/useAuth';
import { PLAN_DEFINITIONS, type PlanId } from '@/lib/constants/plans';
import { formatDate, getInitials } from '@/lib/utils/helpers';
import {
  User, Mail, CreditCard, FileText, Target, TrendingUp, Award,
  Map, Download, Trash2, Shield, ArrowRight,
  CheckCircle, AlertTriangle, ExternalLink, LogOut, Camera,
  Sparkles, Loader2,
} from 'lucide-react';
import Link from 'next/link';

export function SettingsPage() {
  const { currentPlan, usage, getUsagePercent } = usePlan();
  const { resumes } = useResumes();
  const { user } = useAuth();
  const planDef = PLAN_DEFINITIONS[currentPlan];

  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/user/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aura-resume-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 dark:text-slate-400 mt-1">Manage your account, plan, and preferences</p>
      </div>

      {/* Profile Section */}
      <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Profile</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
              {user?.image ? (
                <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-surface-500 dark:text-slate-400">{getInitials(user?.name || 'User')}</span>
              )}
            </div>
            <button className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-surface-900 dark:text-white" />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ''}
                  className="w-full px-4 py-2.5 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                />
              </div>
            </div>
            <p className="text-surface-400 dark:text-slate-500 text-sm">Member since {user?.id ? 'Recently' : 'Unknown'}</p>
          </div>
        </div>
      </section>

      {/* Plan & Usage Section */}
      <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Current Plan</h2>
          </div>
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm"
          >
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className={`p-5 rounded-2xl border ${planDef.borderColor} ${planDef.bgColor} mb-6`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-lg font-bold ${planDef.color}`}>{planDef.name}</span>
            <span className="text-surface-900 dark:text-white font-semibold">
              {planDef.price === 0 ? 'Free' : `₹${planDef.price}`}
              <span className="text-surface-500 dark:text-slate-400 text-sm ml-1">{planDef.period}</span>
            </span>
          </div>
          {planDef.monthlyEquiv && (
            <p className="text-surface-500 dark:text-slate-400 text-sm">{planDef.monthlyEquiv}</p>
          )}
        </div>

        <h3 className="text-sm font-medium text-surface-500 dark:text-slate-400 mb-4">Usage This Period</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <UsageStat
            icon={FileText}
            label="Resumes"
            value={usage.resumes}
            percent={getUsagePercent('resumes')}
            color="indigo"
          />
          <UsageStat
            icon={TrendingUp}
            label="Scans This Month"
            value={usage.scansThisMonth}
            percent={getUsagePercent('scansThisMonth')}
            color="emerald"
          />
          <UsageStat
            icon={Target}
            label="Job Matches"
            value={usage.jobMatches}
            percent={getUsagePercent('jobMatches')}
            color="amber"
          />
          <UsageStat
            icon={Award}
            label="Tailored Resumes"
            value={usage.tailoredResumes}
            percent={getUsagePercent('tailoredResumes')}
            color="purple"
          />
          <UsageStat
            icon={Map}
            label="Roadmaps"
            value={usage.roadmaps}
            percent={getUsagePercent('roadmaps')}
            color="pink"
          />
          <UsageStat
            icon={Sparkles}
            label="Total Resumes"
            value={resumes.length}
            percent={100}
            color="indigo"
          />
        </div>
      </section>

      {/* Account Actions */}
      <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Account</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full flex items-center justify-between p-4 bg-surface-100 dark:bg-slate-800/30 rounded-xl hover:bg-surface-100 dark:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-surface-500 dark:text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <div className="text-left">
                <p className="text-surface-900 dark:text-white font-medium">Export All Data</p>
                <p className="text-surface-400 dark:text-slate-500 text-sm">Download all your resumes, analyses, and account data as JSON</p>
              </div>
            </div>
            {exporting ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5 text-surface-400 dark:text-slate-500 group-hover:text-surface-900 dark:text-white transition-colors" />
            )}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between p-4 bg-surface-100 dark:bg-slate-800/30 rounded-xl hover:bg-rose-500/5 border border-transparent hover:border-rose-500/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-surface-500 dark:text-slate-400 group-hover:text-rose-400 transition-colors" />
              <div className="text-left">
                <p className="text-surface-900 dark:text-white font-medium group-hover:text-rose-400 transition-colors">Delete Account</p>
                <p className="text-surface-400 dark:text-slate-500 text-sm">Permanently delete your account and all associated data</p>
              </div>
            </div>
            <AlertTriangle className="w-5 h-5 text-surface-400 dark:text-slate-500 group-hover:text-rose-400 transition-colors" />
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-surface-900 dark:text-white font-semibold mb-1">Are you absolutely sure?</p>
                <p className="text-surface-500 dark:text-slate-400 text-sm">
                  This action cannot be undone. All your resumes, job matches, roadmaps, and account data will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-surface-900 dark:text-white text-sm font-semibold rounded-xl transition-colors">
                Yes, Delete Everything
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function UsageStat({
  icon: Icon,
  label,
  value,
  percent,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  percent: number;
  color: string;
}) {
  const gradientMap: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  const textMap: Record<string, string> = {
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
  };

  return (
    <div className="p-4 bg-surface-100 dark:bg-slate-800/30 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${textMap[color]}`} />
          <span className="text-sm text-surface-500 dark:text-slate-400">{label}</span>
        </div>
        <span className="text-lg font-bold text-surface-900 dark:text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-surface-200 dark:bg-surface-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradientMap[color]} transition-all duration-500`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}
