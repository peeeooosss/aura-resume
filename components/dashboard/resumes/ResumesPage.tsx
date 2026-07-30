'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useResumes } from '@/lib/hooks/useResumes';
import { usePlan } from '@/lib/hooks/usePlan';
import { FileText, Trash2, Star, Shield, Sparkles, Eye, Wrench, MoreHorizontal, FilePen, ExternalLink, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';

type FilterTab = 'all' | 'uploaded' | 'analyzed' | 'fixed';

export function ResumesPage() {
  const router = useRouter();
  const { resumes, setPrimary, deleteResume, loading } = useResumes();
  const currentPlan = usePlan(s => s.currentPlan);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const PLAN_TIER: Record<string, number> = { free: 0, quick: 1, pro: 2, vip: 3 };
  const canSave = (PLAN_TIER[currentPlan] ?? 0) >= (PLAN_TIER['pro'] ?? 0);

  const filteredResumes = filter === 'all'
    ? resumes
    : resumes.filter(r => r.status?.toLowerCase() === filter);

  const counts = {
    all: resumes.length,
    uploaded: resumes.filter(r => r.status?.toLowerCase() === 'uploaded' || r.status?.toLowerCase() === 'parsed').length,
    analyzed: resumes.filter(r => r.status?.toLowerCase() === 'analyzed').length,
    fixed: resumes.filter(r => r.status?.toLowerCase() === 'fixed').length,
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'uploaded', label: `Uploaded (${counts.uploaded})` },
    { key: 'analyzed', label: `Analyzed (${counts.analyzed})` },
    { key: 'fixed', label: `Fixed (${counts.fixed})` },
  ];

  if (resumes.length === 0 && !loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-surface-400 dark:text-slate-500" />
          </div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">No Resumes Yet</h1>
          <p className="text-surface-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Upload and analyze your first resume in the Resume Fixer.
          </p>
          <Link
            href="/dashboard/fixer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <Wrench className="w-5 h-5" />
            Go to Resume Fixer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">My Resumes</h1>
        <p className="text-surface-500 dark:text-slate-400 mt-1">Manage, analyze, and optimize your resumes</p>
      </div>

      {!canSave && (
        <div className="mb-6 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-white">Upgrade to Pro to save resumes</p>
              <p className="text-sm text-surface-500 dark:text-slate-400">Free and Quick Fix plans can view analysis but cannot save resumes.</p>
            </div>
          </div>
          <Link
            href="/plans?plan=pro"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm flex-shrink-0"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      <div className="flex gap-1 mb-6 p-1 bg-surface-100 dark:bg-slate-800/50 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === tab.key
                ? 'bg-white dark:bg-slate-900 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredResumes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-surface-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No {filter !== 'all' ? filter : ''} resumes</h3>
          <p className="text-surface-500 dark:text-slate-400 text-sm">Upload a resume in the Fixer or change the filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              isPrimary={resume.isPrimary}
              onSetPrimary={setPrimary}
              onDelete={deleteResume}
              isMenuOpen={openMenuId === resume.id}
              onToggleMenu={setOpenMenuId}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status: string) {
  const s = status?.toLowerCase() || '';
  if (s === 'fixed') return { label: 'Fixed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (s === 'analyzed') return { label: 'Analyzed', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  if (s === 'uploaded' || s === 'parsed') return { label: 'Uploaded', color: 'text-slate-400 bg-surface-100 dark:bg-slate-800 border-surface-200 dark:border-slate-700' };
  return { label: s, color: 'text-slate-400 bg-surface-100 dark:bg-slate-800 border-surface-200 dark:border-slate-700' };
}

function ResumeCard({ resume, isPrimary, onSetPrimary, onDelete, isMenuOpen, onToggleMenu, router }: any) {
  const badge = getStatusBadge(resume.status);
  const hasAnalysis = resume.atsScore !== null && resume.atsScore !== undefined;

  return (
    <div className={cn(
      'group bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-5 hover:border-surface-300 dark:hover:border-slate-700 transition-all relative',
      isPrimary && 'ring-1 ring-indigo-500/30'
    )}>
      {isPrimary && (
        <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-full">
          Primary
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-slate-800 flex items-center justify-center">
          <FileText className="w-6 h-6 text-surface-500 dark:text-slate-400" />
        </div>
        <div className="flex items-center gap-1">
          {resume.version && resume.version > 1 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              v{resume.version}
            </span>
          )}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleMenu(isMenuOpen ? null : resume.id); }}
              className="p-1.5 rounded-lg text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => onToggleMenu(null)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 animate-fade-in">
                  <button
                    onClick={() => { onToggleMenu(null); router.push(`/dashboard/fixer?resumeId=${resume.id}&source=resumes`); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-surface-400" />
                    View Details
                  </button>
                  {hasAnalysis && (
                    <>
                      <button
                        onClick={() => { onToggleMenu(null); router.push(`/dashboard/resumes/${resume.id}/report`); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-surface-400" />
                        View Report
                      </button>
                      <button
                        onClick={() => { onToggleMenu(null); router.push(`/dashboard/jobs/compare?resumeId=${resume.id}`); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-surface-400" />
                        Tailor for Job
                      </button>
                      <button
                        onClick={() => { onToggleMenu(null); router.push(`/dashboard/templates`); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <FilePen className="w-4 h-4 text-surface-400" />
                        Generate Cover Letter
                      </button>
                    </>
                  )}
                  <div className="border-t border-surface-200 dark:border-slate-800 my-1" />
                  {!isPrimary && (
                    <button
                      onClick={() => { onToggleMenu(null); onSetPrimary(resume.id); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Star className="w-4 h-4 text-surface-400" />
                      Set as Primary
                    </button>
                  )}
                  <button
                    onClick={() => { onToggleMenu(null); onDelete(resume.id); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-surface-900 dark:text-white truncate flex-1">{resume.fileName || resume.title}</h3>
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', badge.color)}>
          {badge.label}
        </span>
      </div>
      <p className="text-surface-400 dark:text-slate-500 text-sm mb-4">
        {resume.createdAt ? `Uploaded ${formatDate(resume.createdAt)}` : ''}
        {resume.parent && ` · Forked from v${resume.parent.version}`}
      </p>

      {hasAnalysis ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-600 dark:text-slate-300">ATS Score</span>
            <span className={cn('text-xl font-bold', resume.atsScore >= 80 ? 'text-emerald-400' : resume.atsScore >= 60 ? 'text-amber-400' : 'text-rose-400')}>
              {resume.atsScore}/100
            </span>
          </div>
          <div className="h-2 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', resume.atsScore >= 80 ? 'bg-emerald-500' : resume.atsScore >= 60 ? 'bg-amber-500' : 'bg-rose-500')}
              style={{ width: `${resume.atsScore}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-surface-100 dark:bg-slate-800/50 rounded-xl text-center">
          <Shield className="w-5 h-5 text-surface-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-surface-400 dark:text-slate-500 text-sm">Not analyzed yet</p>
        </div>
      )}

      {(resume.skills?.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {resume.skills.slice(0, 4).map((skill: string) => (
            <span key={skill} className="px-2 py-0.5 text-xs bg-surface-100 text-surface-700 dark:bg-slate-800 dark:text-slate-300 rounded-full">{skill}</span>
          ))}
          {resume.skills.length > 4 && (
            <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">+{resume.skills.length - 4} more</span>
          )}
        </div>
      )}

      <div className="space-y-2 pt-4 border-t border-surface-200 dark:border-slate-800">
        {resume.status?.toLowerCase() === 'fixed' ? (
          <Link
            href={`/dashboard/jobs/compare?resumeId=${resume.id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Tailor for Job
          </Link>
        ) : resume.status?.toLowerCase() === 'analyzed' ? (
          <Link
            href={`/dashboard/fixer?resumeId=${resume.id}&source=resumes`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            <Wrench className="w-4 h-4" />
            AI Rewrite
          </Link>
        ) : (
          <Link
            href={`/dashboard/fixer`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:text-white font-medium transition-all"
          >
            <Eye className="w-4 h-4" />
            Analyze Now
          </Link>
        )}
      </div>
    </div>
  );
}
