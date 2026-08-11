'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Zap, ArrowRight, Sparkles, FileText, X, Check, AlertTriangle, Download, Eye, Loader2, Target, TrendingUp, IndianRupee, ChevronDown, ChevronUp, Lock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { generateAnalysisPDF, getPDFBlobURL, generateOptimizedResumePDF } from '@/lib/pdf/generateReport';
import type { JobRolePotential } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { usePlan } from '@/lib/hooks/usePlan';
import { useCredits } from '@/lib/hooks/useCredits';
import Link from 'next/link';

function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const ext = name.split('.').pop();
  if (ext === 'pdf' || ext === 'doc' || ext === 'docx') return true;
  if (file.type === 'application/pdf') return true;
  if (file.type.includes('word')) return true;
  return false;
}

interface AnalysisData {
  id: string;
  score: number;
  strengths: string[];
  redFlags: string[];
  suggestions: string[];
  keywordGaps: string[];
  originalText: string;
  jobRolePotential?: JobRolePotential;
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

function ScoreCircle({ score, size = 140 }: { score: number; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const o = c * (1 - score / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-surface-200 dark:text-slate-400/10" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={8} strokeLinecap="round" className={cn('transition-all duration-1000', getScoreRingColor(score))} strokeDasharray={c} strokeDashoffset={o} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-bold', getScoreColor(score), 'text-4xl')}>{score}</span>
      </div>
    </div>
  );
}

const PLAN_TIER: Record<string, number> = { free: 0, quick: 1, pro: 2, vip: 3 };

function BlurGate({ children, hasAccess, requiredPlan = 'pro' }: { children: React.ReactNode; hasAccess: boolean; requiredPlan?: string }) {
  if (hasAccess) return <>{children}</>;
  return (
    <div className="relative">
      <div className="select-none pointer-events-none blur-[3px] opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Link href={`/plans?plan=${requiredPlan}`} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
          <Lock className="w-4 h-4" />
          Upgrade to {requiredPlan === 'pro' ? 'Pro' : 'Quick Fix'} to unlock
        </Link>
      </div>
    </div>
  );
}

export function FixerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const currentPlan = usePlan(s => s.currentPlan);
  const { refresh: refreshCredits } = useCredits();
  const hasProAccess = (PLAN_TIER[currentPlan] ?? 0) >= (PLAN_TIER['pro'] ?? 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [fixedResume, setFixedResume] = useState<string | null>(null);
  const [reportPdfUrl, setReportPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [showFixedResume, setShowFixedResume] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (isAllowedFile(file)) {
      setSelectedFile(file);
    } else {
      toast('error', `Invalid file type "${file.name.split('.').pop()}". Please upload a PDF or Word document.`);
    }
  }, [toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isAllowedFile(file)) {
      setSelectedFile(file);
    } else {
      toast('error', `Invalid file type "${file.name.split('.').pop()}". Please upload a PDF or Word document.`);
    }
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setAnalysis(null);
    setFixedResume(null);
    setReportPdfUrl(null);
    setSavedResumeId(null);
    setLoadingStep('Parsing resume text...');

    const fileName = selectedFile.name;

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      setLoadingStep('Evaluating ATS compatibility...');
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }
      const data = await res.json();
      if (!data.resume) throw new Error('No analysis data returned');

      setLoadingStep('Identifying keyword gaps...');
      const analysisData: AnalysisData = {
        id: data.id,
        score: data.resume.score,
        strengths: data.resume.strengths || [],
        redFlags: data.resume.redFlags || [],
        suggestions: data.resume.suggestions || [],
        keywordGaps: data.resume.keywordGaps || [],
        originalText: data.resume.originalText || '',
        jobRolePotential: data.resume.jobRolePotential as any,
      };

      setAnalysis(analysisData);
      setSelectedFile(null);
      refreshCredits();

      const doc = generateAnalysisPDF({
        resume: {
          score: analysisData.score,
          strengths: analysisData.strengths,
          redFlags: analysisData.redFlags,
          suggestions: analysisData.suggestions,
          keywordGaps: analysisData.keywordGaps,
          jobRolePotential: analysisData.jobRolePotential,
        },
        fileName: fileName,
        analyzedAt: new Date().toLocaleString(),
      });
      setReportPdfUrl(getPDFBlobURL(doc));

      setLoadingStep('Generating ATS-optimized resume...');
      try {
        const genRes = await fetch('/api/generate-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: analysisData.originalText,
            analysis: {
              score: analysisData.score,
              strengths: analysisData.strengths,
              redFlags: analysisData.redFlags,
              suggestions: analysisData.suggestions,
              keywordGaps: analysisData.keywordGaps,
            },
          }),
        });
        const genData = await genRes.json();
        if (genRes.status === 402 || genData.insufficientCredits) {
          toast('info', 'Analysis complete. Insufficient credits to generate the ATS-optimized rewrite (10 credits). Refill in the sidebar.');
        } else if (genRes.ok && genData.optimizedResume) {
          setFixedResume(genData.optimizedResume);
          setShowFixedResume(true);
          toast('success', 'Resume analyzed and ATS-optimized version generated!');
        } else {
          toast('success', 'Resume analyzed successfully!');
        }
      } catch {
        toast('success', 'Resume analyzed successfully!');
      }
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleSaveToResumes = async () => {
    if (!analysis) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'My Resume',
          rawText: analysis.originalText,
          optimizedText: fixedResume || undefined,
          status: fixedResume ? 'fixed' : 'analyzed',
          atsScore: fixedResume ? 95 : analysis.score,
          strengths: analysis.strengths,
          redFlags: analysis.redFlags,
          suggestions: analysis.suggestions,
          keywordGaps: analysis.keywordGaps,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSavedResumeId(data.resumeId);
      toast('success', 'Saved to My Resumes!');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadFixedResume = () => {
    if (!fixedResume) return;
    const doc = generateOptimizedResumePDF(fixedResume, {
      generatedAt: new Date().toLocaleString(),
    });
    doc.save(`ATS-Optimized-Resume-${Date.now()}.pdf`);
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const doc = generateAnalysisPDF({
      resume: {
        score: analysis.score,
        strengths: analysis.strengths,
        redFlags: analysis.redFlags,
        suggestions: analysis.suggestions,
        keywordGaps: analysis.keywordGaps,
        jobRolePotential: analysis.jobRolePotential,
      },
      fileName: selectedFile?.name || 'resume',
      analyzedAt: new Date().toLocaleString(),
    });
    doc.save(`ATS-Report-${Date.now()}.pdf`);
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setFixedResume(null);
    setReportPdfUrl(null);
    setSavedResumeId(null);
    setShowFixedResume(false);
  };

  const jrp = analysis?.jobRolePotential;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">Resume Fixer</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Upload your resume, get a detailed ATS analysis, and receive an optimized version</p>
        </div>
      </div>

      {!analysis ? (
        <>
          <div className="max-w-xl mx-auto">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => { if (!loading) fileInputRef.current?.click(); }}
              className={cn(
                'relative group cursor-pointer rounded-2xl p-8 text-center border-2 border-dashed transition-all',
                dragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-surface-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-900/80'
              )}
            >
              <div className="mt-6">
                {selectedFile ? (
                  <>
                    <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-400 font-semibold mb-1">{selectedFile.name}</p>
                    <p className="text-surface-400 dark:text-slate-500 text-sm">Click or drop to replace</p>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedFile(null); }}
                      className="mt-3 text-sm text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:text-white underline"
                    >Remove</button>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-surface-400 dark:text-slate-500 group-hover:text-indigo-400 transition-colors mx-auto mb-4" />
                    <p className="text-surface-900 dark:text-white font-semibold mb-1">Drop your resume here</p>
                    <p className="text-surface-400 dark:text-slate-500 text-sm">PDF, DOCX up to 10MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 opacity-0 pointer-events-none"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</span>
              ) : (
                <><Zap className="w-5 h-5 group-hover:animate-pulse" /> Analyze My Resume <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            <p className="text-slate-600 text-sm mt-4">Get your ATS score, keyword gaps, and an optimized version in under 60 seconds</p>

            {loading && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-white dark:bg-slate-900/80 border border-surface-200 dark:border-slate-800 rounded-2xl p-6">
                  <div className="space-y-3 text-left">
                    <p className={cn('flex items-center gap-3 text-sm', loadingStep === 'Parsing resume text...' ? 'text-surface-600 dark:text-slate-300' : 'text-surface-400 dark:text-slate-500')}><Loader2 className={cn('w-4 h-4 text-indigo-400', loadingStep === 'Parsing resume text...' && 'animate-spin')} /> Parsing resume text...</p>
                    <p className={cn('flex items-center gap-3 text-sm', loadingStep === 'Evaluating ATS compatibility...' ? 'text-surface-600 dark:text-slate-300' : 'text-surface-400 dark:text-slate-500')}><Loader2 className={cn('w-4 h-4 text-indigo-400', loadingStep === 'Evaluating ATS compatibility...' && 'animate-spin')} /> Evaluating ATS compatibility...</p>
                    <p className={cn('flex items-center gap-3 text-sm', loadingStep === 'Identifying keyword gaps...' ? 'text-surface-600 dark:text-slate-300' : 'text-surface-400 dark:text-slate-500')}><Loader2 className={cn('w-4 h-4 text-indigo-400', loadingStep === 'Identifying keyword gaps...' && 'animate-spin')} /> Identifying keyword gaps...</p>
                    <p className={cn('flex items-center gap-3 text-sm', loadingStep === 'Generating ATS-optimized resume...' ? 'text-surface-600 dark:text-slate-300' : 'text-surface-400 dark:text-slate-500')}><Loader2 className={cn('w-4 h-4 text-indigo-400', loadingStep === 'Generating ATS-optimized resume...' && 'animate-spin')} /> Generating ATS-optimized resume...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Analysis Complete</h2>
              <p className="text-surface-500 dark:text-slate-400">Detailed ATS report with job potential insights</p>
            </div>
            <button onClick={clearAnalysis} className="p-2 text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!hasProAccess && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 text-sm mb-1">
                    Unlock Full Analysis
                  </h4>
                  <p className="text-amber-600 dark:text-amber-400 text-sm mb-3">
                    Upgrade to <strong>Pro (₹499/3mo)</strong> or <strong>VIP (₹1,499/3mo)</strong> to unlock red flags, keyword gaps, suggestions, job role matching, and save resumes.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/plans?plan=pro"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                    >
                      View Plans
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                    >
                      Quick Fix (₹49) only on landing page
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <ScoreCircle score={analysis.score} size={160} />
                </div>
                <p className="text-surface-500 dark:text-slate-400 text-sm">ATS Compatibility Score</p>
                <div className="mt-4 flex justify-center gap-4 text-sm">
                  <span className="text-surface-500 dark:text-slate-400">Red Flags: <span className="text-rose-400 font-semibold">{analysis.redFlags.length}</span></span>
                  <span className="text-surface-500 dark:text-slate-400">Strengths: <span className="text-emerald-400 font-semibold">{analysis.strengths.length}</span></span>
                </div>
              </div>

              <BlurGate hasAccess={hasProAccess} requiredPlan="pro">
                {jrp && jrp.potentialRoles.length > 0 && (
                  <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-indigo-400" />
                      Job Role Potential
                    </h3>
                    <div className="space-y-3">
                      {jrp.potentialRoles.slice(0, 4).map((role, i) => (
                        <div key={i} className="p-3 bg-surface-100 dark:bg-slate-800 rounded-xl border border-surface-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-surface-900 dark:text-white text-sm">{role.title}</p>
                            <span className={cn('text-xs font-bold', role.matchScore >= 80 ? 'text-emerald-400' : role.matchScore >= 60 ? 'text-amber-400' : 'text-rose-400')}>{role.matchScore}%</span>
                          </div>
                          <p className="text-surface-500 dark:text-slate-400 text-xs mb-1">{role.company} · {role.salaryRange}</p>
                          <div className="flex flex-wrap gap-1">
                            {role.requiredSkills.slice(0, 3).map((s, j) => (
                              <span key={j} className="px-1.5 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-400 rounded">{s}</span>
                            ))}
                            {role.requiredSkills.length > 3 && <span className="text-[10px] text-surface-400">+{role.requiredSkills.length - 3}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {jrp.salaryRange && (
                      <div className="mt-3 pt-3 border-t border-surface-200 dark:border-slate-800">
                        <p className="text-xs text-surface-500 dark:text-slate-400 flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          Salary Range: <span className="text-emerald-400 font-medium">{jrp.salaryRange.average}</span> ({jrp.salaryRange.minimum} – {jrp.salaryRange.maximum})
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </BlurGate>

              <BlurGate hasAccess={hasProAccess} requiredPlan="pro">
                <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                  {savedResumeId ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-medium"><Check className="w-5 h-5" /> Saved to My Resumes</div>
                      <button onClick={() => router.push('/dashboard/resumes')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                        <FileText className="w-5 h-5" /> View in My Resumes
                      </button>
                    </div>
                  ) : (
                    <>
                      <button onClick={handleSaveToResumes} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-40">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                        {isSaving ? 'Saving...' : 'Save to My Resumes'}
                      </button>
                      {fixedResume && (
                        <button onClick={handleDownloadFixedResume} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                          <Sparkles className="w-5 h-5" />
                          Download Optimized Resume
                        </button>
                      )}
                      <button onClick={handleDownloadReport} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-surface-100 dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl text-surface-700 dark:text-slate-300 font-semibold hover:bg-surface-200 dark:hover:bg-slate-700 transition-all">
                        <Download className="w-5 h-5" /> Download Report PDF
                      </button>
                      <button onClick={() => setShowPdfPreview(!showPdfPreview)} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl text-surface-600 dark:text-slate-400 font-medium hover:bg-surface-200 dark:hover:bg-slate-700 transition-all text-sm">
                        <Eye className="w-4 h-4" /> {showPdfPreview ? 'Hide Preview' : 'Preview Report PDF'}
                      </button>
                    </>
                  )}
                </div>
              </BlurGate>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {hasProAccess && showPdfPreview && reportPdfUrl && (
                <div className="bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-3 border-b border-surface-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-medium text-surface-600 dark:text-slate-300">Report Preview</span>
                    <button onClick={() => setShowPdfPreview(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <iframe src={reportPdfUrl} className="w-full h-[600px]" title="Analysis Report" />
                </div>
              )}

              <BlurGate hasAccess={hasProAccess} requiredPlan="pro">
                {analysis.redFlags.length > 0 && (
                  <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="flex items-center gap-2 text-rose-400 font-semibold mb-4"><AlertTriangle className="w-5 h-5" /> Red Flags ({analysis.redFlags.length})</h3>
                    <div className="space-y-2">
                      {analysis.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                          <p className="text-surface-600 dark:text-slate-300 text-sm">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </BlurGate>

              {analysis.strengths.length > 0 && (
                <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-emerald-400 font-semibold mb-4"><Check className="w-5 h-5" /> Strengths ({analysis.strengths.length})</h3>
                  <div className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-surface-600 dark:text-slate-300 text-sm">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <BlurGate hasAccess={hasProAccess} requiredPlan="pro">
                {analysis.keywordGaps.length > 0 && (
                  <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="flex items-center gap-2 text-amber-400 font-semibold mb-4"><TrendingUp className="w-5 h-5" /> Keyword Gaps</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordGaps.map((kw, i) => (
                        <span key={i} className="px-3 py-1.5 text-sm bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </BlurGate>

              <BlurGate hasAccess={hasProAccess} requiredPlan="pro">
                {analysis.suggestions.length > 0 && (
                  <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="flex items-center gap-2 text-blue-400 font-semibold mb-4"><Sparkles className="w-5 h-5" /> Suggestions</h3>
                    <div className="space-y-2">
                      {analysis.suggestions.map((sg, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <p className="text-surface-600 dark:text-slate-300 text-sm">{sg}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </BlurGate>

              {hasProAccess && fixedResume && (
                <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowFixedResume(!showFixedResume)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white">ATS-Optimized Resume</h3>
                        <p className="text-surface-500 dark:text-slate-400 text-sm">AI-fixed version with improved ATS score</p>
                      </div>
                    </div>
                    {showFixedResume ? <ChevronUp className="w-5 h-5 text-surface-400" /> : <ChevronDown className="w-5 h-5 text-surface-400" />}
                  </button>
                  {showFixedResume && (
                    <div className="px-6 pb-6">
                      <div className="bg-surface-50 dark:bg-slate-800/50 rounded-xl p-6 max-h-[600px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-surface-700 dark:text-slate-300 font-mono leading-relaxed">
                          {fixedResume}
                        </pre>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button onClick={handleDownloadFixedResume} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                          <Download className="w-4 h-4" /> Download as PDF
                        </button>
                        <button onClick={() => {
                          navigator.clipboard.writeText(fixedResume);
                          toast('success', 'Resume copied to clipboard!');
                        }} className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl text-surface-700 dark:text-slate-300 font-semibold hover:bg-surface-200 dark:hover:bg-slate-700 transition-all">
                          Copy Text
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
