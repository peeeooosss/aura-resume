'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FileText, Check, AlertTriangle, Lightbulb, Target, ArrowLeft,
  Download, Wrench, Loader2, ChevronDown, ChevronUp, Briefcase,
  DollarSign, Star, Sparkles, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';
import { JobRolePotential } from '@/lib/types';

interface ResumeReportData {
  id: string;
  title: string;
  fileUrl: string;
  rawText: string | null;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  parent: { id: string; title: string; version: number; rawText: string | null } | null;
  children: Array<{ id: string; title: string; version: number; status: string; createdAt: string }>;
  analysis: {
    id: string;
    score: number;
    strengths: string[];
    redFlags: string[];
    suggestions: string[];
    keywordGaps: string[];
    jobRolePotential: JobRolePotential | null;
    modelUsed: string;
    tokensUsed: number;
    createdAt: string;
  } | null;
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

function getScoreRingColor(score: number) {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-amber-500';
  return 'stroke-rose-500';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Needs Work';
}

function ScoreCircle({ score, size = 160 }: { score: number; size?: number }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-surface-200 dark:text-slate-400/10"
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          className={cn('transition-all duration-1000', getScoreRingColor(score))}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold text-4xl', getScoreColor(score))}>{score}</span>
        <span className="text-surface-400 dark:text-slate-500 text-sm">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-surface-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-surface-400 dark:text-slate-500" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h3>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-surface-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-surface-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-surface-200 dark:border-slate-800">
          <div className="pt-4 whitespace-pre-wrap text-surface-600 dark:text-slate-300 text-sm leading-relaxed max-h-[600px] overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function JobRoleCard({ role }: { role: JobRolePotential['potentialRoles'][0] }) {
  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          <h4 className="font-semibold text-surface-900 dark:text-white text-sm">{role.title}</h4>
        </div>
        <span className={cn(
          'text-lg font-bold',
          role.matchScore >= 80 ? 'text-emerald-400' : role.matchScore >= 60 ? 'text-amber-400' : 'text-rose-400'
        )}>
          {role.matchScore}%
        </span>
      </div>
      <p className="text-surface-500 dark:text-slate-400 text-xs mb-2">{role.company}</p>
      <div className="flex items-center gap-1 mb-3">
        <DollarSign className="w-3 h-3 text-emerald-400" />
        <span className="text-emerald-400 text-xs font-semibold">{role.salaryRange}</span>
      </div>
      {role.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {role.requiredSkills.slice(0, 5).map((skill, i) => (
            <span key={i} className="px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              {skill}
            </span>
          ))}
          {role.requiredSkills.length > 5 && (
            <span className="px-2 py-0.5 text-xs bg-surface-100 dark:bg-slate-800 text-surface-500 rounded-full">
              +{role.requiredSkills.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SkillsGapItem({ gap }: { gap: JobRolePotential['skillsGap'][0] }) {
  const importanceColor = {
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-slate-400 bg-surface-100 dark:bg-slate-800 border-surface-200 dark:border-slate-700',
  }[gap.importance];

  return (
    <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-slate-800/50 rounded-xl">
      <div>
        <p className="text-surface-900 dark:text-white text-sm font-medium">{gap.skill}</p>
        <p className="text-surface-400 dark:text-slate-500 text-xs">{gap.currentLevel} → {gap.targetLevel}</p>
      </div>
      <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full border', importanceColor)}>
        {gap.importance}
      </span>
    </div>
  );
}

export function ResumeReport() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id as string;

  const [data, setData] = useState<ResumeReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [resumeId]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}`);
      if (!res.ok) throw new Error('Failed to fetch resume');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError('Failed to load resume report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-surface-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center">
          <p className="text-rose-400 font-semibold">{error || 'Resume not found'}</p>
          <button onClick={fetchReport} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-white text-sm hover:bg-slate-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const analysis = data.analysis;
  const jrp = analysis?.jobRolePotential;

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-surface-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Resumes
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Print / PDF
          </button>
          {data.status !== 'fixed' && (
            <button
              onClick={() => router.push(`/dashboard/fixer?resumeId=${data.id}&source=resumes`)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white text-sm font-semibold hover:shadow-lg transition-all"
            >
              <Wrench className="w-4 h-4" />
              Fix Resume
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{data.title}</h1>
          {data.version > 1 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              v{data.version}
            </span>
          )}
        </div>
        <p className="text-surface-500 dark:text-slate-400 text-sm">
          Analyzed on {formatDate(analysis?.createdAt || data.createdAt)}
          {data.parent && ` · Forked from "${data.parent.title}" v${data.parent.version}`}
        </p>
      </div>

      {analysis && (
        <>
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ScoreCircle score={analysis.score} />
              <div className="flex-1 grid grid-cols-3 gap-4 w-full">
                <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <Check className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-400">{analysis.strengths.length}</p>
                  <p className="text-surface-500 dark:text-slate-400 text-sm">Strengths</p>
                </div>
                <div className="text-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-rose-400">{analysis.redFlags.length}</p>
                  <p className="text-surface-500 dark:text-slate-400 text-sm">Red Flags</p>
                </div>
                <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Tag className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-400">{analysis.keywordGaps.length}</p>
                  <p className="text-surface-500 dark:text-slate-400 text-sm">Keyword Gaps</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
                <Check className="w-5 h-5" />
                Strengths ({analysis.strengths.length})
              </h3>
              <div className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-surface-600 dark:text-slate-300 text-sm">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="flex items-center gap-2 text-rose-400 font-semibold mb-4">
                <AlertTriangle className="w-5 h-5" />
                Red Flags ({analysis.redFlags.length})
              </h3>
              <div className="space-y-2">
                {analysis.redFlags.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-surface-600 dark:text-slate-300 text-sm">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {analysis.keywordGaps.length > 0 && (
              <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-amber-400 font-semibold mb-4">
                  <Tag className="w-5 h-5" />
                  Keyword Gaps ({analysis.keywordGaps.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordGaps.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 text-sm bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-indigo-400 font-semibold mb-4">
                  <Lightbulb className="w-5 h-5" />
                  Suggestions ({analysis.suggestions.length})
                </h3>
                <div className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <p className="text-surface-600 dark:text-slate-300 text-sm">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {jrp && (
              <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-purple-400 font-semibold mb-4">
                  <Target className="w-5 h-5" />
                  Job Role Potential
                </h3>

                {jrp.potentialRoles?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-surface-600 dark:text-slate-300 mb-3">Potential Roles</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {jrp.potentialRoles.map((role, i) => (
                        <JobRoleCard key={i} role={role} />
                      ))}
                    </div>
                  </div>
                )}

                {jrp.skillsGap?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-surface-600 dark:text-slate-300 mb-3">Skills Gap</h4>
                    <div className="space-y-2">
                      {jrp.skillsGap.map((gap, i) => (
                        <SkillsGapItem key={i} gap={gap} />
                      ))}
                    </div>
                  </div>
                )}

                {jrp.salaryRange && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-2">Salary Range</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-surface-600 dark:text-slate-300">Min: <strong>{jrp.salaryRange.minimum}</strong></span>
                      <span className="text-surface-600 dark:text-slate-300">Avg: <strong>{jrp.salaryRange.average}</strong></span>
                      <span className="text-surface-600 dark:text-slate-300">Max: <strong>{jrp.salaryRange.maximum}</strong></span>
                    </div>
                  </div>
                )}

                {jrp.matchReasoning && (
                  <div className="mt-4 p-4 bg-surface-50 dark:bg-slate-800/50 rounded-xl">
                    <h4 className="text-sm font-semibold text-surface-600 dark:text-slate-300 mb-2">Match Reasoning</h4>
                    <p className="text-surface-500 dark:text-slate-400 text-sm">{jrp.matchReasoning}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <CollapsibleSection title="Original Resume" icon={FileText} defaultOpen={false}>
            {data.rawText || 'No resume text available'}
          </CollapsibleSection>

          {data.status === 'fixed' && data.children.length > 0 && (
            <CollapsibleSection title="ATS-Optimized Resume" icon={Sparkles} defaultOpen={false}>
              {data.rawText || 'Optimized resume text available in the fixed version'}
            </CollapsibleSection>
          )}
        </>
      )}

      {!analysis && (
        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Analysis Found</h3>
          <p className="text-surface-500 dark:text-slate-400 mb-6">This resume hasn't been analyzed yet.</p>
          <button
            onClick={() => router.push(`/dashboard/fixer?resumeId=${data.id}&source=resumes`)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
          >
            Analyze Now
          </button>
        </div>
      )}
    </div>
  );
}
