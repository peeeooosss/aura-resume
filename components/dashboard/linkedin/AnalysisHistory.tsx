'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Linkedin, Check, AlertTriangle, Lightbulb, Calendar, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface AnalysisRecord {
  id: string;
  score: number;
  strengths: string[];
  redFlags: string[];
  suggestions: string[];
  modelUsed: string;
  tokensUsed: number;
  createdAt: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

function getScoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
  if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-rose-500/10 border-rose-500/20';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Needs Work';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function AnalysisCard({ analysis, onClick }: { analysis: AnalysisRecord; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left bg-white border shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer w-full',
        getScoreBg(analysis.score)
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Linkedin className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">LinkedIn Analysis</span>
        </div>
        <span className={cn('text-2xl font-bold', getScoreColor(analysis.score))}>{analysis.score}</span>
      </div>

      <div className="mb-3">
        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', getScoreBg(analysis.score), getScoreColor(analysis.score))}>
          {getScoreLabel(analysis.score)}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-400" />
          {analysis.strengths.length} strengths
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          {analysis.redFlags.length} red flags
        </span>
        <span className="flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          {analysis.suggestions.length} tips
        </span>
      </div>

      <div className="flex items-center gap-1 mt-3 text-xs text-slate-400 dark:text-slate-500">
        <Calendar className="w-3 h-3" />
        {formatDate(analysis.createdAt)} at {formatTime(analysis.createdAt)}
      </div>
    </button>
  );
}

function AnalysisDetail({ analysis, onBack }: { analysis: AnalysisRecord; onBack: () => void }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-surface-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to History
      </button>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">LinkedIn Analysis</h3>
          </div>
          <span className={cn('text-3xl font-bold', getScoreColor(analysis.score))}>{analysis.score}</span>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className={cn('text-sm font-semibold px-3 py-1 rounded-full', getScoreBg(analysis.score), getScoreColor(analysis.score))}>
            {getScoreLabel(analysis.score)}
          </span>
          <span className="text-xs text-slate-400">
            Analyzed on {formatDate(analysis.createdAt)} at {formatTime(analysis.createdAt)}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Check className="w-4 h-4" />
            Strengths ({analysis.strengths.length})
          </h4>
          <div className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-surface-600 dark:text-slate-300 text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            Red Flags ({analysis.redFlags.length})
          </h4>
          <div className="space-y-2">
            {analysis.redFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-surface-600 dark:text-slate-300 text-sm">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {analysis.suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Lightbulb className="w-4 h-4" />
              Suggestions ({analysis.suggestions.length})
            </h4>
            <div className="space-y-2">
              {analysis.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-surface-600 dark:text-slate-300 text-sm">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnalysisHistory() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AnalysisRecord | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/linkedin/history');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setAnalyses(data);
    } catch (err) {
      setError('Failed to load analysis history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (selected) {
    return <AnalysisDetail analysis={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">Analysis History</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Your past LinkedIn profile analyses</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/linkedin')}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-sm hover:shadow-lg transition-all"
        >
          New Analysis
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center">
          <p className="text-rose-400 font-semibold">{error}</p>
          <button onClick={fetchHistory} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-white text-sm hover:bg-slate-700 transition-colors">
            Retry
          </button>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Linkedin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Analyses Yet</h3>
          <p className="text-surface-500 dark:text-slate-400 mb-6">Run your first LinkedIn analysis to see results here.</p>
          <button
            onClick={() => router.push('/dashboard/linkedin')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
          >
            Analyze LinkedIn Profile
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map((a) => (
            <AnalysisCard key={a.id} analysis={a} onClick={() => setSelected(a)} />
          ))}
        </div>
      )}
    </div>
  );
}
