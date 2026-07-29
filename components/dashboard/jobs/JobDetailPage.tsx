'use client';

import { useJobMatches } from '@/lib/hooks/useJobMatches';
import { usePlan } from '@/lib/hooks/usePlan';
import { ArrowLeft, MapPin, Briefcase, IndianRupee, Clock, ExternalLink, Heart, CheckCircle, XCircle, Sparkles, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import Link from 'next/link';

function scoreColorClass(score: number) {
  return score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';
}
function scoreBgClass(score: number) {
  return score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { allMatches, toggleSave, generateTailoredResume } = useJobMatches();
  const currentPlan = usePlan(s => s.currentPlan);

  const job = allMatches.find(j => j.id === id);

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Job not found</h1>
        <Link href="/dashboard/jobs/matches" className="text-indigo-400 hover:text-indigo-300">
          Back to matches
        </Link>
      </div>
    );
  }

  const breakdownEntries = Object.entries(job.matchBreakdown);

  const statusStyles: Record<string, { bg: string; text: string }> = {
    NEW: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    SAVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    APPLIED: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/dashboard/jobs/matches"
        className="inline-flex items-center gap-2 text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to matches
      </Link>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-surface-200 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-surface-900 dark:text-white">{job.title}</h1>
                <span className={cn('px-3 py-1 text-sm font-semibold rounded-full', statusStyles[job.status]?.bg, statusStyles[job.status]?.text)}>
                  {job.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-surface-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  {job.company}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  {job.salaryMin ? `₹${(job.salaryMin / 100000).toFixed(1)}L - ₹${(job.salaryMax / 100000).toFixed(1)}L` : 'Salary not listed'}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Posted {new Date(job.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn('px-3 py-1 text-lg font-bold rounded-xl border bg-surface-100 dark:bg-slate-800/50 border-surface-300 dark:border-slate-700', scoreColorClass(job.matchScore))}>
                  {job.matchScore}%
                </span>
                <span className="text-surface-400 dark:text-slate-500">Match Score</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSave(job.id)}
                className={cn(
                  'p-3 rounded-xl transition-colors',
                  job.isSaved ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-slate-800 text-surface-500 dark:text-slate-400 hover:text-rose-400 hover:bg-slate-700'
                )}
              >
                <Heart className={cn('w-5 h-5', job.isSaved && 'fill-current')} />
              </button>
              {job.applyUrl ? (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-surface-900 dark:text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  Apply on {job.source === 'linkedin' ? 'LinkedIn' : job.source === 'indeed' ? 'Indeed' : 'External Site'} <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="px-5 py-3 bg-slate-800 text-surface-400 dark:text-slate-500 font-medium rounded-xl flex items-center gap-2 cursor-not-allowed">
                  Apply link unavailable
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">About the Role</h2>
              <p className="text-surface-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{job.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">Requirements</h2>
              <p className="text-surface-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">Benefits</h2>
              <div className="grid grid-cols-2 gap-3">
                {job.benefits.map((benefit: string) => (
                  <div key={benefit} className="flex items-center gap-2 text-surface-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {benefit}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">AI Match Analysis</h2>
              <p className="text-surface-600 dark:text-slate-300 leading-relaxed">{job.matchReasoning}</p>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-100 dark:bg-slate-800/50 rounded-2xl p-6">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Match Breakdown</h3>
              <div className="space-y-4">
                {breakdownEntries.map(([key, value]) => {
                  const num = Number(value);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-surface-500 dark:text-slate-400 capitalize">{key}</span>
                        <span className={cn('text-sm font-semibold', scoreColorClass(num))}>
                          {num}%
                        </span>
                      </div>
                      <div className="h-2 bg-surface-300 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', scoreBgClass(num))}
                          style={{ width: `${num}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-100 dark:bg-slate-800/50 rounded-2xl p-6">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Skills Match</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-surface-400 dark:text-slate-500 mb-2">Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.matchedSkills.map((skill: string) => (
                      <span key={skill} className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-surface-400 dark:text-slate-500 mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.missingSkills.map((skill: string) => (
                      <span key={skill} className="px-2 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 rounded-lg flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Generate Tailored Resume
              </h3>
              <p className="text-sm text-surface-500 dark:text-slate-400 mb-4">
                AI will optimize your resume specifically for this job description
              </p>
              {currentPlan === 'free' || currentPlan === 'quick' ? (
                <Link
                  href="/plans"
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Upgrade to Pro
                </Link>
              ) : (
                <button
                  onClick={() => generateTailoredResume(job.id)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Generate Tailored Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}