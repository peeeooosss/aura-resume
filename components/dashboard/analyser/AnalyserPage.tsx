'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Linkedin, Zap, ArrowRight, Sparkles, FileText, X, Check, AlertTriangle, Download, RotateCcw, History } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

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
          stroke="rgba(148, 163, 184, 0.1)"
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
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{label}</h3>
          <p className="text-slate-500 text-sm">ATS Compatibility Score</p>
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
              <p className="text-slate-300 text-sm">{strength}</p>
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
              <p className="text-slate-300 text-sm">{flag}</p>
            </div>
          ))}
        </div>
        {analysis.overlappingFlags && analysis.overlappingFlags.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <h5 className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <History className="w-4 h-4" />
              Also Found in Other Source
            </h5>
            <div className="space-y-2">
              {analysis.overlappingFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <History className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 text-sm">{flag}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ analysis, onAnalyzeAgain }: { analysis: DualAnalysisResult; onAnalyzeAgain: () => void }) {
  const date = new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const hasResume = !!analysis.resume;
  const hasLinkedIn = !!analysis.linkedin;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <p className="font-medium text-white">Analysis {analysis.id.slice(0, 8)}</p>
          <p className="text-slate-500 text-sm">{date} {hasResume && 'Resume'}{hasResume && hasLinkedIn && ' + '}{hasLinkedIn && 'LinkedIn'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hasResume && (
          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', getScoreColor(analysis.resume!.score))}>
            {analysis.resume!.score}
          </span>
        )}
        {hasLinkedIn && (
          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', getScoreColor(analysis.linkedin!.score))}>
            {analysis.linkedin!.score}
          </span>
        )}
        <button
          onClick={onAnalyzeAgain}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Analyze again"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function AnalyserPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DualAnalysisResult | null>(null);
  const [history, setHistory] = useState<DualAnalysisResult[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('aura-analyses');
    if (stored) {
      const analyses = Object.values(JSON.parse(stored)) as DualAnalysisResult[];
      setHistory(analyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleSubmit = async () => {
    if (!selectedFile && !linkedinUrl) return;
    setLoading(true);

    const formData = new FormData();
    if (selectedFile) formData.append('resume', selectedFile);
    if (linkedinUrl) formData.append('linkedin', linkedinUrl);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
      analyses[data.id] = data;
      localStorage.setItem('aura-analyses', JSON.stringify(analyses));
      setResults(data);
      setHistory([data, ...history]);
      setSelectedFile(null);
      setLinkedinUrl('');
    } catch {
      setLoading(false);
    }
  };

  const canSubmit = selectedFile || linkedinUrl;

  const clearResults = () => {
    setResults(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Resume Analyser</h1>
          <p className="text-slate-400 mt-1">Upload your resume and get an instant ATS compatibility score with detailed insights</p>
        </div>
      </div>

      {!results ? (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative group cursor-pointer rounded-2xl p-8 text-center border-2 border-dashed transition-all',
                dragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-700 hover:border-indigo-500 bg-slate-900/80'
              )}
            >
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-xs font-semibold text-indigo-400">Resume</span>
              </div>
              <div className="mt-6">
                {selectedFile ? (
                  <>
                    <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-400 font-semibold mb-1">{selectedFile.name}</p>
                    <p className="text-slate-500 text-sm">Click or drop to replace</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="mt-3 text-sm text-slate-500 hover:text-white underline"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 transition-colors mx-auto mb-4" />
                    <p className="text-white font-semibold mb-1">Drop your resume here</p>
                    <p className="text-slate-500 text-sm">PDF, DOCX up to 10MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.docx"
                onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
              />
            </div>

            <div className="rounded-2xl border border-slate-700 hover:border-blue-500 bg-slate-900/80 p-8 transition-all relative">
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <span className="text-xs font-semibold text-blue-400">LinkedIn</span>
              </div>
              <div className="mt-6">
                <Linkedin className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-white font-semibold mb-4 text-center">Paste LinkedIn URL</p>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/yourprofile"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm text-center"
                />
              </div>
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
                  {selectedFile && linkedinUrl ? 'Analyze Both' : 'Analyze My Profile'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-slate-600 text-sm mt-4">Get your ATS score in under 60 seconds</p>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
              <p className="text-slate-400">Your resume has been analyzed against ATS criteria</p>
            </div>
            <button
              onClick={clearResults}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {results.resume && (
              <AnalysisColumn
                analysis={results.resume}
                label="Resume Analysis"
                icon={FileText}
                color="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
              />
            )}
            {results.linkedin && (
              <AnalysisColumn
                analysis={results.linkedin}
                label="LinkedIn Analysis"
                icon={Linkedin}
                color="bg-blue-500/10 border border-blue-500/20 text-blue-400"
              />
            )}
            {!results.resume && !results.linkedin && (
              <div className="md:col-span-2 text-center py-12 text-slate-500">No analysis data available</div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={clearResults}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Analyze Another
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Analysis History</h2>
            <span className="text-slate-500 text-sm">{history.length} total</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.slice(0, 10).map((analysis) => (
              <HistoryItem key={analysis.id} analysis={analysis} onAnalyzeAgain={clearResults} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}