'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target, MessageSquare, Clock, CheckCircle, AlertTriangle, ArrowRight, Loader2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface InterviewReportProps {
  sessionId: string;
  onDone: () => void;
}

interface ReportData {
  overallScore: number;
  scores: {
    technical: number;
    communication: number;
    confidence: number;
    completeness: number;
  };
  summary: string;
  strengths: string[];
  improvements: string[];
  questionFeedback: Array<{
    question: string;
    score: number;
    feedback: string;
    answer: string;
  }>;
}

function ScoreCircle({ score, size = 120, label }: { score: number; size?: number; label: string }) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const color = score >= 70 ? 'stroke-emerald-500' : score >= 40 ? 'stroke-amber-500' : 'stroke-rose-500';
  const textColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-surface-200 dark:text-slate-700"
            strokeWidth={8}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            className={cn('transition-all duration-1000', color)}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', textColor, { 'text-3xl': size >= 120, 'text-xl': size < 120 })}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-surface-400 dark:text-slate-500">{label}</span>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-surface-500 dark:text-slate-400">{label}</span>
        <span className={cn(
          'text-sm font-semibold',
          score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400'
        )}>
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-surface-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function InterviewReport({ sessionId, onDone }: InterviewReportProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    try {
      const res = await fetch('/api/interview/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to load report');
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
        <p className="text-surface-500 dark:text-slate-400">Generating your interview report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-rose-400 mb-4">{error || 'Failed to load report'}</p>
        <button
          onClick={onDone}
          className="px-6 py-2 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-500 transition-colors"
        >
          Back to Interviews
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Interview Complete!</h2>
        <p className="text-surface-500 dark:text-slate-400">Here's your detailed performance report</p>
      </div>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-8">
        <div className="flex justify-center mb-8">
          <ScoreCircle score={report.overallScore} size={160} label="Overall Score" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ScoreBar label="Technical" score={report.scores.technical} />
          <ScoreBar label="Communication" score={report.scores.communication} />
          <ScoreBar label="Confidence" score={report.scores.confidence} />
          <ScoreBar label="Completeness" score={report.scores.completeness} />
        </div>
      </div>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Summary
        </h3>
        <p className="text-surface-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {report.summary}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-400 mb-4">
            <CheckCircle className="w-5 h-5" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-surface-600 dark:text-slate-300 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-400 mb-4">
            <Target className="w-5 h-5" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {report.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-surface-600 dark:text-slate-300 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Question Breakdown
        </h3>
        <div className="space-y-4">
          {report.questionFeedback.map((q, i) => (
            <div key={i} className="border border-surface-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-sm font-medium text-surface-900 dark:text-white">{q.question}</p>
                <span className={cn(
                  'text-sm font-bold flex-shrink-0',
                  q.score >= 70 ? 'text-emerald-400' : q.score >= 40 ? 'text-amber-400' : 'text-rose-400'
                )}>
                  {q.score}
                </span>
              </div>
              <p className="text-xs text-surface-400 dark:text-slate-500 leading-relaxed">{q.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onDone}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          Done
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
