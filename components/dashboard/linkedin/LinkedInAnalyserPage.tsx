'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Linkedin, Zap, ArrowRight, Sparkles, AlertTriangle, Check, X, Download, FileText, Lock, Repeat, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { getPlanDefinition, canAccessFeature } from '@/lib/constants/plans';
import { usePlan } from '@/lib/hooks/usePlan';

interface SingleAnalysis {
  source: 'resume' | 'linkedin';
  score: number;
  strengths: string[];
  redFlags: string[];
  overlappingFlags?: string[];
}

interface DualAnalysisResult {
  id: string;
  resume?: SingleAnalysis;
  linkedin?: SingleAnalysis;
  createdAt: string;
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

function ScoreCircle({ score, size = 120 }: { score: number; size?: number }) {
  const radius = size / 2 - 8;
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
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={8}
          strokeLinecap="round"
          className={cn('transition-all duration-1000', getScoreRingColor(score))}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-bold', getScoreColor(score), { 'text-3xl': size >= 120, 'text-2xl': size < 120 })}>{score}</span>
      </div>
    </div>
  );
}

function AnalysisColumn({ analysis, label, icon: Icon, color }: { analysis: SingleAnalysis; label: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-surface-900 dark:text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{label}</h3>
          <p className="text-surface-400 dark:text-slate-500 text-sm">ATS Compatibility Score</p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <ScoreCircle score={analysis.score} size={140} />
      </div>

      <div className="space-y-4 mb-6">
        <h4 className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Check className="w-5 h-5" />
          Strengths
        </h4>
        <div className="space-y-2">
          {analysis.strengths.map((strength, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-surface-600 dark:text-slate-300 text-sm">{strength}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-rose-400 font-semibold">
          <AlertTriangle className="w-5 h-5" />
          Red Flags
        </h4>
        <div className="space-y-2">
          {analysis.redFlags.map((flag, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-surface-600 dark:text-slate-300 text-sm">{flag}</p>
            </div>
          ))}
        </div>
        {analysis.overlappingFlags && analysis.overlappingFlags.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-surface-200 dark:border-slate-800">
            <h5 className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Repeat className="w-4 h-4" />
              Also Found in Other Source
            </h5>
            <div className="space-y-2">
              {analysis.overlappingFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Repeat className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-surface-600 dark:text-slate-300 text-sm">{flag}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function LinkedInAnalyserPage() {
  const router = useRouter();
  const currentPlan = usePlan(s => s.currentPlan);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DualAnalysisResult | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const hasAccess = currentPlan !== 'free' && currentPlan !== 'quick';

  const handleSubmit = async () => {
    if (!linkedinUrl.trim()) return;
    if (!hasAccess) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: linkedinUrl.trim(), userId: 'demo-user' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      
      const analysis: DualAnalysisResult = {
        id: data.id || `analysis_${Date.now()}`,
        linkedin: {
          source: 'linkedin',
          score: data.score,
          strengths: data.strengths,
          redFlags: data.redFlags,
        },
        createdAt: new Date().toISOString(),
      };
      
      const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
      analyses[analysis.id] = analysis;
      localStorage.setItem('aura-analyses', JSON.stringify(analyses));
      
      setResults(analysis);
      setLinkedinUrl('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = linkedinUrl.trim().length > 0;

  const clearResults = () => setResults(null);

  if (!hasAccess) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">LinkedIn Analyser</h1>
            <p className="text-surface-500 dark:text-slate-400 mt-1">Scrape and analyze your LinkedIn profile for ATS optimization</p>
          </div>
        </div>

        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Pro Feature</h2>
          <p className="text-surface-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            LinkedIn Analyser requires a Pro or VIP plan. Upgrade to unlock AI-powered LinkedIn profile optimization.
          </p>
          <button
            onClick={() => router.push('/plans')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">LinkedIn Analyser</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Paste your LinkedIn URL and get an AI-powered profile analysis</p>
        </div>
      </div>

      {!results ? (
        <>
          <div className="max-w-lg mx-auto bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6 transition-all relative">
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="text-xs font-semibold text-blue-400">LinkedIn</span>
            </div>
            <div className="mt-6">
              <Linkedin className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <p className="text-surface-900 dark:text-white font-semibold mb-3 text-center">Paste LinkedIn Profile URL</p>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="linkedin.com/in/yourprofile"
                className="w-full bg-surface-100 border border-surface-300 dark:bg-slate-800 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm text-center"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="animate-pulse">Analyzing...</span>
              ) : (
                <>
                  <Zap className="w-5 h-5 group-hover:animate-pulse" />
                  Analyze My LinkedIn
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-slate-600 text-sm mt-4">Get your LinkedIn ATS score in under 60 seconds</p>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Analysis Complete</h2>
              <p className="text-surface-500 dark:text-slate-400">Your LinkedIn profile has been analyzed against ATS criteria</p>
            </div>
            <button onClick={clearResults} className="p-2 text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {results.linkedin && (
              <AnalysisColumn
                analysis={results.linkedin}
                label="LinkedIn Analysis"
                icon={Linkedin}
                color="bg-blue-500/10 border border-blue-500/20 text-blue-400"
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={clearResults} className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white hover:bg-slate-700 transition-colors">
              <RotateCcw className="w-5 h-5" />
              Analyze Another
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>
      )}

      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-surface-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Upgrade Required</h3>
            <p className="text-surface-500 dark:text-slate-400 mb-6">LinkedIn Analyser is a Pro feature. Upgrade to unlock it.</p>
            <button onClick={() => { setShowUpgrade(false); router.push('/plans'); }} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all">
              View Plans
            </button>
            <button onClick={() => setShowUpgrade(false)} className="w-full mt-3 px-6 py-3 bg-slate-800 rounded-xl text-surface-900 dark:text-white font-semibold hover:bg-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}