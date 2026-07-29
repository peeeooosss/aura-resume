'use client';

import { usePlan } from '@/lib/hooks/usePlan';
import { useResumes } from '@/lib/hooks/useResumes';
import { useJobMatches } from '@/lib/hooks/useJobMatches';
import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { PlanGate } from '@/components/dashboard/PlanGate';
import { PlanBadge } from '@/components/dashboard/PlanBadge';
import { cn } from '@/lib/utils/helpers';
import {
  FileText, Target, Map, Globe, TrendingUp, CheckCircle,
  Clock, Award, Zap, Sparkles, Users, ArrowRight, Plus,
  ExternalLink, Settings, LayoutDashboard, Scan, Wrench, Upload,
} from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/helpers';
import { useSession } from 'next-auth/react';
import { useMemo, useEffect } from 'react';

export function DashboardOverview() {
  const { data: session } = useSession();
  const currentPlan = usePlan(s => s.currentPlan);
  const usage = usePlan(s => s.usage);
  const getUsagePercent = usePlan(s => s.getUsagePercent);
  const { resumes, getPrimary, hasAnalyzedResume, latestAnalysis } = useResumes();
  const { currentRoadmap, progress } = useRoadmap();
  const { currentPortfolio } = usePortfolio();

  const userName = (session?.user as any)?.name || (session?.user as any)?.email?.split('@')[0] || 'User';

  const primaryResume = getPrimary();

  const resumeSkills = useMemo(() => {
    if (!latestAnalysis) return [];
    const skills = new Set<string>();
    const skillKeywords = [/python/i, /javascript/i, /typescript/i, /react/i, /angular/i, /vue/i,
      /node\.?js/i, /express/i, /django/i, /flask/i, /spring/i, /\.net/i, /java/i, /c#/i, /c\+\+/i, /go/i, /rust/i,
      /swift/i, /kotlin/i, /ruby/i, /php/i, /scala/i, /aws/i, /azure/i, /gcp/i, /cloud/i,
      /docker/i, /kubernetes/i, /k8s/i, /ci\/cd/i, /jenkins/i, /terraform/i, /ansible/i,
      /sql/i, /postgres/i, /mysql/i, /mongodb/i, /redis/i, /nosql/i, /elasticsearch/i,
      /graphql/i, /rest/i, /api/i, /microservice/i, /machine learning/i, /deep learning/i,
      /tensorflow/i, /pytorch/i, /nlp/i, /computer vision/i, /data sci/i, /analytics/i,
      /spark/i, /hadoop/i, /kafka/i, /linux/i, /git/i, /agile/i, /scrum/i, /devops/i];
    const allText = [
      ...(latestAnalysis.strengths || []),
      ...(latestAnalysis.keywordGaps || []),
      ...(latestAnalysis.suggestions || []),
      latestAnalysis.rawText || '',
    ].join(' ');
    for (const kw of skillKeywords) {
      if (kw.test(allText)) {
        skills.add(kw.source.replace(/\?/g, '').replace(/\\/g, ''));
      }
    }
    for (const word of allText.split(/[\s,;]+/)) {
      const w = word.trim().replace(/[^a-zA-Z0-9#+./-]/g, '');
      if (w.length > 2 && /[A-Z]/.test(w) && !/^(the|and|for|with|from|that|this|have|been|were|was|are|not)$/i.test(w)) {
        skills.add(w);
      }
    }
    return Array.from(skills).slice(0, 30);
  }, [latestAnalysis]);

  const { matches, stats, searchRealJobs, hasResumeSkills } = useJobMatches(resumeSkills);

  useEffect(() => {
    if (hasResumeSkills) {
      searchRealJobs('software engineer developer data', 'India');
    }
  }, [hasResumeSkills, searchRealJobs]);

  const activeMatches = matches.filter(m => m.status === 'NEW' || m.status === 'SAVED').slice(0, 3);
  const upcomingTasks = currentRoadmap?.dailyTasks?.filter((t: any) => !t.isCompleted).slice(0, 3) || [];

  const limits = {
    free: { resumes: 1, scansThisMonth: 1, jobMatches: 5, tailoredResumes: 0, roadmaps: 0 },
    quick: { resumes: 3, scansThisMonth: 999, jobMatches: 20, tailoredResumes: 0, roadmaps: 1 },
    pro: { resumes: 999, scansThisMonth: 999, jobMatches: 100, tailoredResumes: 5, roadmaps: 3 },
    vip: { resumes: 999, scansThisMonth: 999, jobMatches: 999, tailoredResumes: 999, roadmaps: 999 },
  }[currentPlan];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">Welcome back, {userName} 👋</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Here's your career progress at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <PlanBadge plan={currentPlan as any} size="lg" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Resumes"
          value={usage.resumes}
          max={limits.resumes}
          percent={getUsagePercent('resumes')}
          color="indigo"
          href="/dashboard/resumes"
        >
          <span className="text-xs text-surface-400 dark:text-slate-500">{primaryResume?.atsScore ? `${primaryResume.atsScore}/100 ATS` : 'Upload to analyze'}</span>
        </StatCard>

        <StatCard
          icon={Target}
          label="Job Matches"
          value={stats.total}
          max={limits.jobMatches}
          percent={getUsagePercent('jobMatches')}
          color="emerald"
          href="/dashboard/jobs/matches"
        >
          <span className="text-xs text-surface-400 dark:text-slate-500">{stats.saved} saved · {stats.applied} applied</span>
        </StatCard>

        <StatCard
          icon={Award}
          label="Tailored Resumes"
          value={usage.tailoredResumes}
          max={limits.tailoredResumes}
          percent={getUsagePercent('tailoredResumes')}
          color="amber"
          href="/dashboard/resumes"
        >
          <span className="text-xs text-surface-400 dark:text-slate-500">{limits.tailoredResumes === 999 ? 'Unlimited' : `${usage.tailoredResumes}/${limits.tailoredResumes} this month`}</span>
        </StatCard>

        <StatCard
          icon={Map}
          label="Roadmaps"
          value={usage.roadmaps}
          max={limits.roadmaps}
          percent={getUsagePercent('roadmaps')}
          color="purple"
          href="/dashboard/roadmap"
        >
          <span className="text-xs text-surface-400 dark:text-slate-500">{currentRoadmap ? `${currentRoadmap.progress}% complete` : 'Generate your first roadmap'}</span>
        </StatCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <QuickActionCard
          icon={Plus}
          title="Upload Resume"
          description="Upload PDF/DOCX for ATS analysis"
          href="/dashboard/resumes"
          primary
        />
        <PlanGate
          requiredPlan="pro"
          featureName="Resume Fixer"
          showUpgrade={false}
          fallback={<LockedQuickAction icon={Wrench} title="Resume Fixer" description="Pro plan required" requiredPlan="pro" />}
        >
          <QuickActionCard
            icon={Wrench}
            title="Resume Fixer"
            description="Fix errors & download improved resume"
            href="/dashboard/fixer"
          />
        </PlanGate>
        <PlanGate
          requiredPlan="pro"
          featureName="Job Match Analyzer"
          showUpgrade={false}
          fallback={<LockedQuickAction icon={Target} title="Find Job Matches" description="Pro plan required" requiredPlan="pro" />}
        >
          <QuickActionCard
            icon={Target}
            title="Find Job Matches"
            description="AI-matched roles for your profile"
            href="/dashboard/jobs/matches"
          />
        </PlanGate>
        <PlanGate
          requiredPlan="pro"
          featureName="90-Day Roadmap"
          showUpgrade={false}
          fallback={<LockedQuickAction icon={Map} title="Generate Roadmap" description="Pro plan required" requiredPlan="pro" />}
        >
          <QuickActionCard
            icon={Map}
            title="Generate Roadmap"
            description="90-day plan for your target role"
            href="/dashboard/roadmap/generate"
          />
        </PlanGate>
        <PlanGate
          requiredPlan="pro"
          featureName="Portfolio Builder"
          showUpgrade={false}
          fallback={<LockedQuickAction icon={Globe} title="Build Portfolio" description="Pro plan required" requiredPlan="pro" />}
        >
          <QuickActionCard
            icon={Globe}
            title="Build Portfolio"
            description="Auto-generate from your resume"
            href="/dashboard/portfolio"
          />
        </PlanGate>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Resume & Matches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Resume Status */}
          <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Primary Resume</h2>
                  <p className="text-surface-500 dark:text-slate-400 text-sm">{primaryResume?.fileName || 'No resume uploaded'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {primaryResume && (
                  <Link href={`/dashboard/resumes/${primaryResume.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link href="/dashboard/resumes" className="px-4 py-2 bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-surface-900 dark:text-surface-900 dark:text-white text-sm font-medium rounded-xl transition-colors">
                  {primaryResume ? 'Manage All' : 'Upload Resume'}
                </Link>
              </div>
            </div>

            {primaryResume && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  label="ATS Score"
                  value={primaryResume.atsScore ?? '—'}
                  max={100}
                  color="indigo"
                  icon={TrendingUp}
                />
                <MetricCard
                  label="Skills Detected"
                  value={primaryResume.skills?.length || 0}
                  color="emerald"
                  icon={Award}
                />
                <MetricCard
                  label="Experience"
                  value={`${primaryResume.experience?.length || 0} roles`}
                  color="amber"
                  icon={Clock}
                />
                <MetricCard
                  label="Red Flags"
                  value={primaryResume.redFlags?.length || 0}
                  color={primaryResume.redFlags && primaryResume.redFlags.length > 2 ? 'rose' : 'emerald'}
                  icon={CheckCircle}
                />
              </div>
            )}
          </section>

          {/* Top Job Matches */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Top Job Matches</h2>
              {hasResumeSkills && (
                <Link href="/dashboard/jobs/matches" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {hasResumeSkills ? (
                activeMatches.length > 0 ? (
                  activeMatches.map((match) => (
                    <JobMatchCard key={match.id} match={match} />
                  ))
                ) : (
                  <div className="text-center py-8 bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-surface-600 dark:text-slate-300 font-medium">Searching for matching jobs...</p>
                    <p className="text-surface-400 dark:text-slate-500 text-sm mt-1">We'll find the best roles for your skills</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-surface-600 dark:text-slate-300 font-medium">Upload your resume to see job matches</p>
                  <p className="text-surface-400 dark:text-slate-500 text-sm mt-1">We'll match jobs to your skills and experience</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Progress & Quick Links */}
        <div className="space-y-6">
          {/* Plan Progress */}
          <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Plan Progress</h2>
              <PlanBadge plan={currentPlan as any} size="md" />
            </div>

            <div className="space-y-4">
              {[
                { key: 'resumes', label: 'Resumes', icon: FileText, color: 'indigo' },
                { key: 'scansThisMonth', label: 'Scans This Month', icon: TrendingUp, color: 'emerald' },
                { key: 'jobMatches', label: 'Job Matches', icon: Target, color: 'amber' },
                { key: 'tailoredResumes', label: 'Tailored Resumes', icon: Award, color: 'purple' },
                { key: 'roadmaps', label: 'Roadmaps', icon: Map, color: 'pink' },
              ].map(({ key, label, icon: Icon, color }) => (
                <UsageBar
                  key={key}
                  label={label}
                  icon={Icon}
                  used={usage[key as keyof typeof usage]}
                  limit={limits[key as keyof typeof limits]}
                  color={color}
                />
              ))}
            </div>

            <Link
              href="/plans"
              className="mt-6 block w-full text-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              View All Plans & Upgrade <ArrowRight className="w-4 h-4 inline ml-2" />
            </Link>
          </section>

          {/* Active Roadmap Progress */}
          {currentRoadmap && (
            <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">Active Roadmap</h2>
                <Link href={`/dashboard/roadmap/${currentRoadmap.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                  View Details <ArrowRight className="w-4 h-4 inline" />
                </Link>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-surface-500 dark:text-slate-400">{currentRoadmap.targetRole}</span>
                  <span className="font-bold text-surface-900 dark:text-white">{currentRoadmap.progress}%</span>
                </div>
                <div className="h-2 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${currentRoadmap.progress}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {upcomingTasks.slice(0, 3).map((task: any) => (
                  <TaskPreviewCard key={task.id} task={task} />
                ))}
                {upcomingTasks.length > 3 && (
                  <Link
                    href={`/dashboard/roadmap/${currentRoadmap.id}`}
                    className="block text-center text-indigo-400 hover:text-indigo-300 text-sm font-medium py-2"
                  >
                    View all {upcomingTasks.length} tasks <ArrowRight className="w-4 h-4 inline ml-1" />
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Portfolio Status */}
          {currentPortfolio && (
            <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">Your Portfolio</h2>
                <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">Published</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-surface-100 dark:bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{currentPortfolio.views}</p>
                  <p className="text-surface-400 dark:text-slate-500 text-xs">Total Views</p>
                </div>
                <div className="bg-surface-100 dark:bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{currentPortfolio.uniqueVisitors}</p>
                  <p className="text-surface-400 dark:text-slate-500 text-xs">Unique Visitors</p>
                </div>
              </div>
              <Link
                href={`/portfolio/${currentPortfolio.slug}`}
                target="_blank"
                className="block w-full px-4 py-2 bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-surface-900 dark:text-surface-900 dark:text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Live Portfolio
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  label,
  value,
  max,
  percent,
  color,
  href,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  max: number;
  percent: number;
  color: 'indigo' | 'emerald' | 'amber' | 'purple';
  href: string;
  children?: React.ReactNode;
}) {
  const colorStyles = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const gradientStyles = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <Link
      href={href}
      className="group bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-5 hover:border-surface-300 dark:border-slate-700 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="w-2 h-2 rounded-full bg-gradient-to-r bg-gradient-to-r" style={{ background: `linear-gradient(to right, ${color === 'indigo' ? '#6366f1' : color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : '#a855f7'}, ${color === 'indigo' ? '#8b5cf6' : color === 'emerald' ? '#34d399' : color === 'amber' ? '#fbbf24' : '#c084fc'})` }} />
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
        <p className="text-surface-400 dark:text-slate-500 text-xs">{label}</p>
      </div>
      {max !== 999 && (
        <div className="h-1.5 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${gradientStyles[color as keyof typeof gradientStyles]}`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      )}
      {children && <div className="mt-3 pt-3 border-t border-surface-200 dark:border-slate-800">{children}</div>}
    </Link>
  );
}

function MetricCard({ label, value, max, color, icon: Icon }: { label: string; value: string | number; max?: number; color: string; icon: React.ComponentType<{ className?: string }> }) {
  const colorMap = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
  };
  return (
    <div className="bg-surface-100 dark:bg-slate-800/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${colorMap[color as keyof typeof colorMap]}`} />
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}{max ? `/${max}` : ''}</p>
      <p className="text-surface-400 dark:text-slate-500 text-xs">{label}</p>
    </div>
  );
}

function UsageBar({ label, icon: Icon, used, limit, color }: { label: string; icon: React.ComponentType<{ className?: string }>; used: number; limit: number; color: string }) {
  const percent = limit === 999 ? 100 : Math.min(100, Math.round((used / limit) * 100));
  const colorMap = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-surface-600 dark:text-slate-300">
          <Icon className="w-4 h-4 text-surface-400 dark:text-slate-500" />
          {label}
        </span>
        <span className="font-semibold text-surface-900 dark:text-white">{limit === 999 ? 'Unlimited' : `${used}/${limit}`}</span>
      </div>
      <div className="h-1.5 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: colorMap[color as keyof typeof colorMap] }}
        />
      </div>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, href, primary }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; href: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl p-5 transition-all ${
        primary
          ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 hover:border-indigo-500/50'
          : 'bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 hover:border-surface-300 dark:border-slate-700'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex flex-col h-full">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">{title}</h3>
        <p className="text-surface-500 dark:text-slate-400 text-sm flex-1">{description}</p>
        <div className="flex items-center gap-1 text-indigo-400 font-medium text-sm mt-auto">
          Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function JobMatchCard({ match }: { match: any }) {
  const statusColors = {
    NEW: 'bg-blue-500/20 text-blue-400',
    SAVED: 'bg-emerald-500/20 text-emerald-400',
    APPLIED: 'bg-amber-500/20 text-amber-400',
    INTERVIEWING: 'bg-purple-500/20 text-purple-400',
  };
  return (
    <Link
      href={`/dashboard/jobs/${match.id}`}
      className="group block bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl p-4 hover:border-surface-300 dark:border-slate-700 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-surface-900 dark:text-surface-900 dark:text-white group-hover:text-indigo-400 transition-colors">{match.title}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[match.status as keyof typeof statusColors] || 'bg-slate-500/20 text-surface-500 dark:text-slate-400'}`}>
              {match.status}
            </span>
          </div>
          <p className="text-surface-500 dark:text-slate-400 text-sm mb-2 flex items-center gap-2">
            <span>{match.company}</span>
            <span>·</span>
            <span>{match.location}</span>
            <span>·</span>
            <span>{match.salaryMin && match.salaryMax ? `₹${(match.salaryMin/100000).toFixed(1)}L - ₹${(match.salaryMax/100000).toFixed(1)}L` : ''}</span>
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold text-indigo-400">{match.matchScore}%</span>
              <span className="text-surface-400 dark:text-slate-500 text-xs">Match</span>
            </div>
            <div className="flex items-center gap-1 text-surface-400 dark:text-slate-500 text-xs">
              <span className="text-emerald-400">{match.matchedSkills.length} matched</span>
              <span>·</span>
              <span className="text-rose-400">{match.missingSkills.length} missing</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          <ArrowRight className="w-5 h-5 text-surface-400 dark:text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

function TaskPreviewCard({ task }: { task: any }) {
  const typeStyles = {
    LEARN: 'bg-blue-500/20 text-blue-400',
    BUILD: 'bg-emerald-500/20 text-emerald-400',
    NETWORK: 'bg-purple-500/20 text-purple-400',
    APPLY: 'bg-indigo-500/20 text-indigo-400',
    INTERVIEW_PREP: 'bg-amber-500/20 text-amber-400',
  };
  const typeIcons = {
    LEARN: '📚',
    BUILD: '🛠️',
    NETWORK: '🤝',
    APPLY: '📝',
    INTERVIEW_PREP: '🎯',
  };
  return (
    <div className="flex items-center gap-3 p-3 bg-surface-100 dark:bg-slate-800/50 rounded-xl">
      <span className="text-lg">{typeIcons[task.type as keyof typeof typeIcons]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-surface-900 dark:text-surface-900 dark:text-white text-sm font-medium truncate">{task.title}</p>
        <p className="text-surface-400 dark:text-slate-500 text-xs">{task.duration} min</p>
      </div>
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeStyles[task.type as keyof typeof typeStyles]}`}>
        {task.type}
      </span>
    </div>
  );
}

function LockedQuickAction({ icon: Icon, title, description, requiredPlan }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; requiredPlan: string }) {
  return (
    <Link
      href={`/plans?plan=${requiredPlan}`}
      className="group relative overflow-hidden rounded-2xl p-5 bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-slate-800 opacity-75 hover:opacity-100 transition-all"
    >
      <div className="flex flex-col h-full">
        <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-surface-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">{title}</h3>
        <p className="text-surface-500 dark:text-slate-400 text-sm flex-1">{description}</p>
        <div className="flex items-center gap-1 text-indigo-400 font-medium text-sm mt-auto">
          Upgrade <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  );
}