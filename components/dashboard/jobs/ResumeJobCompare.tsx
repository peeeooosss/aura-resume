'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileSearch, FileText, AlertCircle, CheckCircle, XCircle, Sparkles, Download, Loader2, ArrowRight, IndianRupee } from 'lucide-react';
import { generateOptimizedResumePDF, getPDFBlobURL } from '@/lib/pdf/generateReport';
import { useResumes } from '@/lib/hooks/useResumes';

export default function ResumeJobCompare() {
  const { resumes } = useResumes();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tailoredPdfUrl, setTailoredPdfUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  const fixedResumes = resumes.filter(r => r.status?.toLowerCase() === 'fixed' || r.rawText);

  const getResumeData = useCallback(() => {
    if (!selectedResumeId) return null;
    const resume = resumes.find(r => r.id === selectedResumeId);
    if (!resume?.rawText) return null;
    return {
      originalText: resume.rawText,
      analysis: { score: resume.atsScore, strengths: resume.strengths, redFlags: resume.redFlags },
      id: resume.id,
    };
  }, [selectedResumeId, resumes]);

  useEffect(() => {
    if (fixedResumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(fixedResumes[0].id);
    }
  }, [fixedResumes, selectedResumeId]);

  const handleCompare = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setMatchResult(null);
    setTailoredPdfUrl(null);

    const resumeData = getResumeData();
    if (!resumeData?.originalText) {
      setError('No resume found. Please upload and analyze a resume first from the Resume Analyser.');
      setIsAnalyzing(false);
      return;
    }

    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          resumeText: resumeData.originalText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Comparison failed');
      setMatchResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    const resumeData = getResumeData();
    if (!resumeData) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeData.originalText,
          analysis: resumeData.analysis,
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle || 'this role',
          company: company || 'this company',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const doc = generateOptimizedResumePDF(data.optimizedResume, {
        generatedAt: new Date().toLocaleString(),
      });
      setTailoredPdfUrl(getPDFBlobURL(doc));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const resumeData = getResumeData();
    if (!resumeData) return;
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeData.originalText,
          analysis: resumeData.analysis,
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle || 'this role',
          company: company || 'this company',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const doc = generateOptimizedResumePDF(data.optimizedResume, {
        generatedAt: new Date().toLocaleString(),
      });
      doc.save(`Tailored-Resume-${jobTitle || 'Job'}-${Date.now()}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const resumeData = getResumeData();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-900 dark:text-white">Resume vs Job Description</h1>
        <p className="text-surface-500 dark:text-slate-400 mt-1">Compare your resume against a job description and generate a tailored version</p>
      </div>

      {fixedResumes.length > 0 && (
        <div className="bg-white border border-surface-200 rounded-2xl shadow-sm dark:bg-slate-900/80 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Select Resume to Compare
          </h2>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="w-full bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm"
          >
            {fixedResumes.map(r => (
              <option key={r.id} value={r.id}>
                {r.fileName || r.title} {r.atsScore ? `(ATS: ${r.atsScore}/100)` : ''} {r.status === 'fixed' ? '(AI Fixed)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {!resumeData && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 dark:bg-amber-500/5 dark:border-amber-500/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">No resume found</p>
              <p className="text-amber-600 dark:text-amber-400 text-sm">
                {fixedResumes.length === 0
                  ? 'No resumes with extractable text found. Upload and analyze a resume first, then use the Resume Fixer to get a fixed version, then come back here.'
                  : 'The selected resume has no extractable text. Please choose another one.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-surface-200 rounded-2xl shadow-sm dark:bg-slate-900/80 dark:border-slate-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-indigo-500" />
          Job Description
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="Job Title (e.g. Senior Frontend Engineer)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:border-indigo-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-surface-900 dark:text-white dark:placeholder-slate-500"
          />
          <input
            type="text"
            placeholder="Company (e.g. Stripe)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:border-indigo-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-surface-900 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <textarea
          placeholder="Paste the full job description here — include requirements, qualifications, responsibilities, and any preferred skills..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-surface-50 border border-surface-300 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:border-indigo-500 resize-y dark:bg-slate-800/50 dark:border-slate-700 dark:text-surface-900 dark:text-white dark:placeholder-slate-500"
        />

        <button
          onClick={handleCompare}
          disabled={isAnalyzing || !jobDescription.trim() || !resumeData}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
          {isAnalyzing ? 'Analyzing...' : 'Compare with My Resume'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-6 dark:bg-rose-500/5 dark:border-rose-500/20">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        </div>
      )}

      {matchResult && (
        <div className="space-y-6">
          <div className="bg-white border border-surface-200 rounded-2xl shadow-sm dark:bg-slate-900/80 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-900 dark:text-white mb-6">Match Analysis</h2>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold text-emerald-600">{matchResult.matchScore}</span>
                  <span className="text-sm text-emerald-600 block">%</span>
                </div>
              </div>
              <div>
                <p className="text-surface-900 dark:text-surface-900 dark:text-white font-semibold text-lg">Match Score</p>
                <p className="text-surface-500 dark:text-slate-400 text-sm">{matchResult.matchReasoning}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="flex items-center gap-2 text-emerald-600 font-semibold mb-3">
                  <CheckCircle className="w-4 h-4" /> Matched Skills ({matchResult.matchedSkills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {matchResult.matchedSkills?.map((s: string) => (
                    <span key={s} className="px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-full dark:bg-emerald-500/10 dark:text-emerald-400">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-rose-600 font-semibold mb-3">
                  <XCircle className="w-4 h-4" /> Missing Skills ({matchResult.missingSkills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missingSkills?.map((s: string) => (
                    <span key={s} className="px-3 py-1 text-sm bg-rose-50 text-rose-700 rounded-full dark:bg-rose-500/10 dark:text-rose-400">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {matchResult.recommendations?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-surface-900 dark:text-surface-900 dark:text-white font-semibold mb-3">Recommendations</h3>
                <ul className="space-y-1">
                  {matchResult.recommendations.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-surface-600 dark:text-slate-300 text-sm">
                      <ArrowRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white border border-surface-200 rounded-2xl shadow-sm dark:bg-slate-900/80 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Generate Tailored Resume
            </h2>
            <p className="text-surface-500 dark:text-slate-400 text-sm mb-4">
              AI will rewrite your resume specifically for this job, addressing the gaps identified above.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !resumeData}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Generate & Preview'}
              </button>
              <button
                onClick={handleDownload}
                disabled={isGenerating || !resumeData}
                className="px-5 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-700 font-medium hover:bg-surface-200 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Quick Download
              </button>
            </div>

            {isGenerating && (
              <div className="flex items-center gap-3 mt-4 p-4 bg-indigo-50 rounded-xl dark:bg-indigo-500/5">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <span className="text-indigo-700 dark:text-indigo-300 text-sm">AI is tailoring your resume for {jobTitle || 'this role'} at {company || 'this company'}...</span>
              </div>
            )}

            {tailoredPdfUrl && !isGenerating && (
              <div className="mt-4">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline mb-3 inline-block"
                >
                  {previewMode ? 'Hide Preview' : 'Show Preview'}
                </button>
                {previewMode && (
                  <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-slate-700 bg-white">
                    <iframe src={tailoredPdfUrl} className="w-full h-[600px]" title="Tailored Resume Preview" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
