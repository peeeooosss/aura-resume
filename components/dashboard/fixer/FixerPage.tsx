'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useResumes } from '@/lib/hooks/useResumes';
import { usePlan } from '@/lib/hooks/usePlan';
import { PlanGate } from '@/components/dashboard/PlanGate';
import { FileText, Wrench, Download, AlertTriangle, Check, Sparkles, ArrowRight, Loader2, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { generateOptimizedResumePDF, getPDFBlobURL } from '@/lib/pdf/generateReport';

export function FixerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resumes } = useResumes();
  const currentPlan = usePlan(s => s.currentPlan);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [fixedResume, setFixedResume] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const resumeId = searchParams.get('resumeId');
    const source = searchParams.get('source');
    if (resumeId) {
      setSelectedResumeId(resumeId);
    } else if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
    if (source === 'analyser') {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [resumes, searchParams, selectedResumeId]);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  const handleFix = async () => {
    if (!selectedResume) return;
    setIsFixing(true);
    setError(null);
    setFixedResume(null);
    setPdfUrl(null);

    try {
      const rawText = selectedResume.rawText || '';
      if (!rawText || rawText.trim().length < 50) {
        throw new Error('This resume has no extractable text. Please re-upload the PDF.');
      }

      const res = await fetch('/api/resume/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResume.id,
          userId: selectedResume.userId || 'user_1',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fix failed');

      setFixedResume(data.optimizedResume);

      const doc = generateOptimizedResumePDF(data.optimizedResume, {
        generatedAt: new Date().toLocaleString(),
      });
      setPdfUrl(getPDFBlobURL(doc));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fix resume');
    } finally {
      setIsFixing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!fixedResume) return;
    const doc = generateOptimizedResumePDF(fixedResume, {
      candidateName: selectedResume?.fileName?.replace('.pdf', '').replace('.docx', ''),
      generatedAt: new Date().toLocaleString(),
    });
    doc.save(`Fixed-${selectedResume?.fileName?.replace('.pdf', '').replace('.docx', '') || 'Resume'}-${Date.now()}.pdf`);
  };

  if (resumes.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">No Resumes Found</h2>
        <p className="text-surface-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Upload a resume first to use the Resume Fixer. We'll rewrite it to achieve a perfect ATS score.</p>
        <a
          href="/dashboard/resumes"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all"
        >
          <FileText className="w-5 h-5" />
          Upload Resume
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md">
            <Check className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Resume analyzed. Select it and click "Fix with AI" to generate a perfect ATS version.</p>
            <button onClick={() => setShowToast(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">Resume Fixer</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Select a resume and let AI rewrite it for a perfect 95+ ATS score</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Select Resume</h3>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => {
                setSelectedResumeId(e.target.value);
                setFixedResume(null);
                setPdfUrl(null);
                setError(null);
              }}
              className="w-full bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fileName} {r.isPrimary ? '(Primary)' : ''} {r.status === 'fixed' ? '(Fixed)' : ''}
                </option>
              ))}
            </select>

            {selectedResume && (
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-surface-200 dark:border-slate-800">
                  <p className="text-surface-500 dark:text-slate-400 text-sm mb-2">ATS Score: <span className={cn('font-semibold', (selectedResume.atsScore || 0) >= 80 ? 'text-emerald-400' : (selectedResume.atsScore || 0) >= 60 ? 'text-amber-400' : 'text-rose-400')}>{selectedResume.atsScore || 'N/A'}/100</span></p>
                  <p className="text-surface-500 dark:text-slate-400 text-sm mb-2">Version: <span className="text-surface-900 dark:text-white font-semibold">v{selectedResume.version || 1}</span></p>
                  <p className="text-surface-500 dark:text-slate-400 text-sm">Status: <span className={cn('font-semibold capitalize', selectedResume.status === 'fixed' ? 'text-emerald-400' : 'text-blue-400')}>{selectedResume.status?.toLowerCase() || 'parsed'}</span></p>
                </div>

                <button
                  onClick={handleFix}
                  disabled={isFixing || !selectedResume.rawText}
                  className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isFixing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wrench className="w-5 h-5" />
                  )}
                  {isFixing ? 'Fixing Resume...' : 'Fix with AI'}
                </button>

                {!selectedResume.rawText && (
                  <p className="text-amber-400 text-xs text-center">This resume has no extractable text. Re-upload the PDF.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-rose-400 font-semibold mb-1">Fix Failed</h4>
                  <p className="text-surface-500 dark:text-slate-400 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isFixing && (
            <div className="bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-8">
              <div className="flex flex-col items-center text-center py-8">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-6" />
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">AI is Rewriting Your Resume</h3>
                <div className="space-y-2 text-surface-500 dark:text-slate-400 text-sm">
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Analyzing ATS gaps</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Rewriting sections with metrics</p>
                  <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Injecting missing keywords</p>
                  <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Generating PDF...</p>
                </div>
              </div>
            </div>
          )}

          {fixedResume && !isFixing && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="text-emerald-400 font-semibold text-lg">Resume Fixed!</h3>
                    <p className="text-surface-500 dark:text-slate-400 text-sm">AI has rewritten your resume for maximum ATS compatibility.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-slate-800">
                  <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Fixed Resume Preview
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-slate-800 rounded-xl text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:text-white font-medium transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>

                {showPreview && pdfUrl && (
                  <div className="bg-white">
                    <iframe src={pdfUrl} className="w-full h-[600px]" title="Fixed Resume Preview" />
                  </div>
                )}

                <div className="p-5 max-h-[600px] overflow-y-auto">
                  <pre className="text-sm text-surface-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{fixedResume}</pre>
                </div>
              </div>
            </div>
          )}

          {!fixedResume && !isFixing && !error && (
            <div className="text-center py-16 bg-white border border-surface-200 dark:bg-slate-900/50 dark:border-surface-200 dark:border-slate-800 rounded-2xl">
              <Wrench className="w-12 h-12 text-surface-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">Ready to Fix Your Resume</h3>
              <p className="text-surface-500 dark:text-slate-400 max-w-md mx-auto">
                Select a resume from the sidebar, then click "Fix with AI" to get a perfectly optimized ATS version with quantified achievements and missing keywords.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
