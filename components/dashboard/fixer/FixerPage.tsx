'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Zap, ArrowRight, Sparkles, FileText, X, Check, AlertTriangle, Download, RotateCcw, Wrench, Eye, Loader2, Briefcase, IndianRupee, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { generateAnalysisPDF, getPDFBlobURL, generateOptimizedResumePDF } from '@/lib/pdf/generateReport';
import type { JobRolePotential } from '@/lib/types';
import { usePlan } from '@/lib/hooks/usePlan';
import { PlanGate } from '@/components/dashboard/PlanGate';
import { useToast } from '@/components/ui/Toast';

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

export function FixerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [reportPdfUrl, setReportPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPerfect, setIsGeneratingPerfect] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('word'))) setSelectedFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setAnalysis(null);
    setReportPdfUrl(null);
    setSavedResumeId(null);

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('userId', 'user_1');

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }
      const data = await res.json();
      if (!data.resume) throw new Error('No analysis data returned');

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

      const doc = generateAnalysisPDF({
        resume: {
          score: analysisData.score,
          strengths: analysisData.strengths,
          redFlags: analysisData.redFlags,
          suggestions: analysisData.suggestions,
          keywordGaps: analysisData.keywordGaps,
          jobRolePotential: analysisData.jobRolePotential,
        },
        fileName: selectedFile.name,
        analyzedAt: new Date().toLocaleString(),
      });
      setReportPdfUrl(getPDFBlobURL(doc));

      toast('success', 'Resume analyzed successfully! Save it to My Resumes for later use.');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
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
          userId: 'user_1',
          title: selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'My Resume',
          rawText: analysis.originalText,
          status: 'analyzed',
          atsScore: analysis.score,
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

  const handleGeneratePerfect = async () => {
    if (!analysis) return;
    setIsGeneratingPerfect(true);
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: analysis.originalText,
          analysis: {
            score: analysis.score,
            strengths: analysis.strengths,
            redFlags: analysis.redFlags,
            suggestions: analysis.suggestions,
            keywordGaps: analysis.keywordGaps,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const doc = generateOptimizedResumePDF(data.optimizedResume, {
        generatedAt: new Date().toLocaleString(),
      });
      doc.save(`Perfect-ATS-Resume-${Date.now()}.pdf`);

      const saveRes = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_1',
          title: 'Perfect ATS Resume',
          rawText: data.optimizedResume,
          status: 'fixed',
          parentId: analysis.id,
          atsScore: 95,
        }),
      });
      const saveData = await saveRes.json();
      if (saveRes.ok) setSavedResumeId(saveData.resumeId);

      toast('success', 'Perfect ATS resume generated and saved!');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGeneratingPerfect(false);
    }
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
    setReportPdfUrl(null);
    setSavedResumeId(null);
  };

  const jrp = analysis?.jobRolePotential;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">Resume Fixer</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Upload your resume and get a detailed ATS analysis with job potential insights</p>
        </div>
      </div>

      {!analysis ? (
        <>
          <div className="max-w-xl mx-auto">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !loading && fileInputRef.current?.click()}
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
                    <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="mt-3 text-sm text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:text-white underline">Remove</button>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-surface-400 dark:text-slate-500 group-hover:text-indigo-400 transition-colors mx-auto mb-4" />
                    <p className="text-surface-900 dark:text-white font-semibold mb-1">Drop your resume here</p>
                    <p className="text-surface-400 dark:text-slate-500 text-sm">PDF, DOCX up to 10MB</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.docx" onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
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
            <p className="text-slate-600 text-sm mt-4">Get your ATS score, keyword gaps, and job potential in under 60 seconds</p>

            {loading && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-white dark:bg-slate-900/80 border border-surface-200 dark:border-slate-800 rounded-2xl p-6">
                  <div className="space-y-3 text-left">
                    <p className="flex items-center gap-3 text-surface-600 dark:text-slate-300 text-sm"><Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /> Parsing resume text...</p>
                    <p className="flex items-center gap-3 text-surface-500 dark:text-slate-400 text-sm"><Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /> Evaluating ATS compatibility...</p>
                    <p className="flex items-center gap-3 text-surface-500 dark:text-slate-400 text-sm"><Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /> Identifying keyword gaps...</p>
                    <p className="flex items-center gap-3 text-surface-500 dark:text-slate-400 text-sm"><Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /> Analyzing job role potential...</p>
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
                    <PlanGate requiredPlan="pro" featureName="Perfect Resume Generation">
                      <button onClick={handleGeneratePerfect} disabled={isGeneratingPerfect} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40">
                        {isGeneratingPerfect ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isGeneratingPerfect ? 'Generating...' : 'Generate Perfect Resume'}
                      </button>
                    </PlanGate>
                    <button onClick={handleDownloadReport} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-surface-100 dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl text-surface-700 dark:text-slate-300 font-semibold hover:bg-surface-200 dark:hover:bg-slate-700 transition-all">
                      <Download className="w-5 h-5" /> Download Report PDF
                    </button>
                    <button onClick={() => setShowPdfPreview(!showPdfPreview)} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl text-surface-600 dark:text-slate-400 font-medium hover:bg-surface-200 dark:hover:bg-slate-700 transition-all text-sm">
                      <Eye className="w-4 h-4" /> {showPdfPreview ? 'Hide Preview' : 'Preview Report PDF'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {showPdfPreview && reportPdfUrl && (
                <div className="bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-3 border-b border-surface-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-medium text-surface-600 dark:text-slate-300">Report Preview</span>
                    <button onClick={() => setShowPdfPreview(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <iframe src={reportPdfUrl} className="w-full h-[600px]" title="Analysis Report" />
                </div>
              )}

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
