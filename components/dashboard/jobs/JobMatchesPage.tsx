'use client';

import { useState } from 'react';
import { useJobMatches } from '@/lib/hooks/useJobMatches';
import { Target, Heart, ExternalLink, MapPin, Briefcase, DollarSign, ArrowRight, CheckCircle, Clock, Star, Filter } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import Link from 'next/link';

export function JobMatchesPage() {
  const { matches, savedOnly, setSavedOnly, toggleSave, stats } = useJobMatches();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusOptions = [
    { value: 'all', label: 'All Matches', count: stats.total },
    { value: 'NEW', label: 'New', count: matches.filter(m => m.status === 'NEW').length },
    { value: 'SAVED', label: 'Saved', count: stats.saved },
    { value: 'APPLIED', label: 'Applied', count: stats.applied },
  ];

  const filteredMatches = matches.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Job Matches</h1>
            <p className="text-slate-400">AI-powered matches for your resume</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={cn(
              'p-4 rounded-2xl border transition-all',
              statusFilter === option.value
                ? 'bg-indigo-600/20 border-indigo-500/30 text-white'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
            )}
          >
            <p className="text-2xl font-bold">{option.count}</p>
            <p className="text-sm">{option.label}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredMatches.map((job) => (
          <JobMatchCard key={job.id} job={job} onToggleSave={toggleSave} />
        ))}

        {filteredMatches.length === 0 && (
          <div className="text-center py-16 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
            <p className="text-slate-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function JobMatchCard({ job, onToggleSave }: { job: any; onToggleSave: (id: string) => void }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const scoreColor = job.matchScore >= 80 ? 'text-emerald-400' : job.matchScore >= 60 ? 'text-amber-400' : 'text-slate-400';
  const scoreBg = job.matchScore >= 80 ? 'bg-emerald-500/20 border-emerald-500/30' : job.matchScore >= 60 ? 'bg-amber-500/20 border-amber-500/30' : 'bg-slate-500/20 border-slate-500/30';

  const statusStyles: Record<string, { bg: string; text: string }> = {
    NEW: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    SAVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    APPLIED: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    INTERVIEWING: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/dashboard/jobs/${job.id}`} className="text-xl font-semibold text-white hover:text-indigo-400 transition-colors">
                {job.title}
              </Link>
              <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-full border', scoreBg, scoreColor)}>
                {job.matchScore}% Match
              </span>
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', statusStyles[job.status]?.bg, statusStyles[job.status]?.text)}>
                {job.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                {job.company}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Skills:</span>
                <span className="text-sm font-medium text-emerald-400">{job.matchedSkills.length} matched</span>
                <span className="text-slate-600">·</span>
                <span className="text-sm font-medium text-rose-400">{job.missingSkills.length} missing</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.matchedSkills.slice(0, 5).map((skill: string) => (
                <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg">
                  {skill}
                </span>
              ))}
              {job.matchedSkills.length > 5 && (
                <span className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-400 rounded-lg">
                  +{job.matchedSkills.length - 5} more
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href={`/dashboard/jobs/${job.id}`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => onToggleSave(job.id)}
              className={cn(
                'p-2 rounded-xl transition-colors',
                job.isSaved ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700'
              )}
            >
              <Heart className={cn('w-5 h-5', job.isSaved && 'fill-current')} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showBreakdown ? 'Hide breakdown' : 'Show match breakdown'}
        </button>

        {showBreakdown && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(job.matchBreakdown).map(([key, value]) => {
                const num = Number(value);
                const strokeColor = num >= 80 ? 'text-emerald-500' : num >= 60 ? 'text-amber-500' : 'text-rose-500';
                return (
                  <div key={key} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-800" />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray={`${num * 1.76} 176`}
                          className={strokeColor}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                        {num}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 capitalize">{key}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800 flex items-center justify-between">
        <p className="text-sm text-slate-500 line-clamp-1 flex-1">{job.matchReasoning}</p>
        <div className="flex items-center gap-2 ml-4">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            Apply <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}