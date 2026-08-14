'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Check, Lock, Shield, ArrowLeft, Sparkles, FileText, Linkedin as LinkedinIcon, Link, Star, Zap, Users, ArrowRight, Target, Loader2, Download, Eye, CheckCircle } from 'lucide-react';
import type { DualAnalysisResult, SingleAnalysis } from '@/lib/types';
import { generateMockAnalysis } from '@/lib/mockData';
import { generateAnalysisPDF, generateOptimizedResumePDF, getPDFBlobURL, type AnalysisReportData } from '@/lib/pdf/generateReport';
import { useCreditsStore } from '@/lib/hooks/useCredits';
import { PLAN_DEFINITIONS } from '@/lib/constants/plans';

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-amber-500';
  return 'stroke-rose-500';
}

function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto mb-6">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
        <circle
          cx="60" cy="60" r="54" fill="none" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${getScoreRingColor(score)} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-slate-500 text-xs">/100</span>
      </div>
    </div>
  );
}

function AnalysisColumn({ analysis, isResume, isUnlocked }: { analysis: SingleAnalysis; isResume: boolean; isUnlocked: boolean }) {
  const sourceConfig = isResume
    ? {
        icon: FileText,
        label: 'Resume Analysis',
        bgClass: 'bg-indigo-500/10',
        borderClass: 'border-indigo-500/20',
        textClass: 'text-indigo-400',
        strengthBorder: 'border-emerald-500/20',
        strengthBg: 'bg-emerald-500/5',
        flagBorder: 'border-rose-500/20',
        flagBg: 'bg-rose-500/5',
      }
    : {
        icon: LinkedinIcon,
        label: 'LinkedIn Profile',
        bgClass: 'bg-blue-500/10',
        borderClass: 'border-blue-500/20',
        textClass: 'text-blue-400',
        strengthBorder: 'border-emerald-500/20',
        strengthBg: 'bg-emerald-500/5',
        flagBorder: 'border-rose-500/20',
        flagBg: 'bg-rose-500/5',
      };

  const Icon = sourceConfig.icon;
  const blurClass = isUnlocked ? '' : 'select-none pointer-events-none blur-[3px] opacity-50';

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl ${sourceConfig.bgClass} border ${sourceConfig.borderClass} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${sourceConfig.textClass}`} />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${sourceConfig.textClass}`}>{sourceConfig.label}</h2>
          <p className="text-slate-500 text-xs">{isUnlocked ? 'Full unlocked report' : 'Score breakdown'}</p>
        </div>
      </div>

      <ScoreCircle score={analysis.score} />

      <div className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-500 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          Strengths
        </h3>
        <div className="space-y-2">
          {analysis.strengths.map((s, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 ${sourceConfig.strengthBg} rounded-xl border ${sourceConfig.strengthBorder}`}>
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-emerald-50 font-medium text-sm leading-snug">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-rose-500 mb-4">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-rose-500" />
          </div>
          Critical Red Flags
          {isUnlocked && (
            <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
              <Shield className="w-2.5 h-2.5" />
              Unlocked
            </span>
          )}
        </h3>
        <div className="relative">
          <div className={`space-y-2 ${blurClass}`}>
            {analysis.redFlags.map((flag, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 ${sourceConfig.flagBg} rounded-xl border ${sourceConfig.flagBorder}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-2" />
                <p className="text-rose-50 font-medium text-sm leading-snug">{flag}</p>
              </div>
            ))}
            {analysis.overlappingFlags?.map((flag, i) => (
              <div key={`overlap-${i}`} className={`flex items-start gap-3 p-3 ${sourceConfig.flagBg} rounded-xl border ${sourceConfig.flagBorder}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                <div>
                  <p className="text-rose-50 font-medium text-sm leading-snug">{flag}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                    <Link className="w-2.5 h-2.5" />
                    Also found in {isResume ? 'LinkedIn' : 'Resume'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isUnlocked && analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 text-sm font-bold text-amber-500 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            Improvement Suggestions
          </h3>
          <div className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                <p className="text-amber-50 font-medium text-sm leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isUnlocked && analysis.keywordGaps && analysis.keywordGaps.length > 0 && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 text-sm font-bold text-blue-500 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            Keyword Gaps
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.keywordGaps.map((gap, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.jobRolePotential && (
        <div className="relative mt-8">
          <h3 className="flex items-center gap-2 text-sm font-bold text-blue-500 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            Job Role Potential
          </h3>
          <div className={`space-y-4 ${blurClass}`}>
            <div className={`p-4 rounded-xl border ${sourceConfig.flagBorder} ${sourceConfig.flagBg}`}>
              <h4 className="text-blue-400 font-semibold text-sm mb-3">Top Matching Roles</h4>
              <div className="space-y-2">
                {analysis.jobRolePotential.potentialRoles.slice(0, 3).map((role, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                    <div>
                      <p className="text-white font-medium text-sm">{role.title}</p>
                      <p className="text-slate-400 text-xs">{role.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold text-lg">{role.matchScore}%</p>
                      <p className="text-emerald-400 text-xs font-medium">{role.salaryRange}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${sourceConfig.flagBorder} ${sourceConfig.flagBg}`}>
              <h4 className="text-blue-400 font-semibold text-sm mb-3">Skills Gap Analysis</h4>
              <div className="space-y-2">
                {analysis.jobRolePotential.skillsGap.slice(0, 5).map((gap, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                    <span className="text-white text-sm">{gap.skill}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      gap.importance === 'high' ? 'bg-rose-500/20 text-rose-400' :
                      gap.importance === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {gap.importance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${sourceConfig.flagBorder} ${sourceConfig.flagBg}`}>
              <h4 className="text-blue-400 font-semibold text-sm mb-3">Salary Potential</h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
                <div className="text-left">
                  <p className="text-slate-400 text-xs">Average</p>
                  <p className="text-emerald-400 font-bold text-2xl">{analysis.jobRolePotential.salaryRange.average}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">Range</p>
                  <p className="text-white font-semibold">{analysis.jobRolePotential.salaryRange.minimum} - {analysis.jobRolePotential.salaryRange.maximum}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  id?: string;
  testMode?: boolean;
}

export default function ResultsContent({ id, testMode }: Props) {
  const router = useRouter();
  const { status } = useSession();
  const [result, setResult] = useState<DualAnalysisResult | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [resumePdfUrl, setResumePdfUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const resumeGeneratedRef = useRef(false);

  useEffect(() => {
    if (testMode) {
      setResult(generateMockAnalysis('resume.pdf', 'linkedin.com/in/test'));
      setLoading(false);
      return;
    }

    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    const stored = sessionStorage.getItem(`aura-result-${id}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setResult(data);
        const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
        analyses[id] = data;
        localStorage.setItem('aura-analyses', JSON.stringify(analyses));
        setLoading(false);
        return;
      } catch {
        // fall through
      }
    }

    const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
    if (analyses[id]) {
      setResult(analyses[id]);
      setLoading(false);
      return;
    }

    setError(true);
    setLoading(false);
  }, [id, testMode]);

  useEffect(() => {
    if (!id || loading) return;
    const unlocked = localStorage.getItem(`aura-unlocked-${id}`);
    setIsUnlocked(!!unlocked);
  }, [id, loading]);

  const generateResumePDF = useCallback(async () => {
    if (!result || resumeGeneratedRef.current) return;
    resumeGeneratedRef.current = true;
    setGeneratingResume(true);

    try {
      const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
      let optimizedText = id ? analyses[id]?.optimizedResumeText : undefined;

      if (!optimizedText && result.resume?.originalText) {
        if (status !== 'authenticated') {
          // Guest path: try to recover the previously-generated optimized resume
          // from the completed payment (no auth required).
          try {
            const res = await fetch(`/api/results/recover?resultId=${encodeURIComponent(id || '')}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.optimizedResume) {
                optimizedText = data.optimizedResume;
                if (id) {
                  analyses[id] = analyses[id] || {};
                  analyses[id].optimizedResumeText = optimizedText;
                  localStorage.setItem('aura-analyses', JSON.stringify(analyses));
                }
              }
            }
          } catch (recoverErr) {
            console.error('Guest resume recovery failed:', recoverErr);
          }
        }

        if (!optimizedText && status !== 'authenticated') {
          setGeneratingResume(false);
          return;
        }

        if (!optimizedText && status === 'authenticated') {
          const response = await fetch('/api/generate-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeText: result.resume.originalText,
              analysis: result.resume,
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Generation failed');
          optimizedText = data.optimizedResume;
          if (id) {
            analyses[id].optimizedResumeText = optimizedText;
            localStorage.setItem('aura-analyses', JSON.stringify(analyses));
          }
          useCreditsStore.getState().refresh();
        }
      }

      if (!optimizedText) {
        setGeneratingResume(false);
        return;
      }

      const doc = generateOptimizedResumePDF(optimizedText, {
        generatedAt: new Date().toLocaleString(),
      });

      setResumePdfUrl(getPDFBlobURL(doc));
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setGeneratingResume(false);
    }
  }, [result, id, status]);

  useEffect(() => {
    if (result && isUnlocked) {
      generateResumePDF();
    }
  }, [result, isUnlocked, generateResumePDF]);

  const handleDownloadReport = () => {
    if (!result) return;
    setDownloadingReport(true);

    try {
      const analyzedAt = new Date(result.createdAt || result.purchasedAt || Date.now()).toLocaleString();

      const reportData: AnalysisReportData = {
        resume: result.resume ? {
          score: result.resume.score,
          strengths: result.resume.strengths,
          redFlags: result.resume.redFlags,
          suggestions: result.resume.suggestions,
          keywordGaps: result.resume.keywordGaps,
          jobRolePotential: result.resume.jobRolePotential,
        } : undefined,
        linkedin: result.linkedin ? {
          score: result.linkedin.score,
          strengths: result.linkedin.strengths,
          redFlags: result.linkedin.redFlags,
          suggestions: result.linkedin.suggestions,
        } : undefined,
        coverLetter: result.coverLetter,
        creditsUsed: result.creditsUsed,
        creditsRemaining: result.creditsRemaining,
        fileName: 'resume.pdf',
        analyzedAt,
      };

      const doc = generateAnalysisPDF(reportData);
      doc.save(`aura-detailed-report-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Report PDF generation failed:', error);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleDownloadResume = () => {
    if (!result || !id) return;
    setDownloadingResume(true);

    try {
      const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
      const optimizedText = analyses[id]?.optimizedResumeText;
      if (!optimizedText) {
        setDownloadingResume(false);
        return;
      }

      const doc = generateOptimizedResumePDF(optimizedText, {
        generatedAt: new Date().toLocaleString(),
      });
      doc.save(`ATS-Optimized-Resume-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Resume PDF download failed:', error);
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleQuickFixPurchase = () => {
    if (!result?.resume || !id) return;

    const paymentUrl = `/payment?plan=quick-fix&resultId=${encodeURIComponent(id)}`;
    router.push(paymentUrl);
  };

  const handlePlanPurchase = (planSlug: string) => {
    const paymentUrl = `/payment?plan=${planSlug}${id ? `&resultId=${encodeURIComponent(id)}` : ''}`;
    if (status === 'authenticated') {
      router.push(paymentUrl);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(paymentUrl)}`);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading your analysis...</p>
      </main>
    );
  }

  if (error || (!id && !testMode)) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">No analysis found.</p>
          <button onClick={() => router.push('/')} className="text-indigo-400 hover:text-indigo-300 underline">
            Go back and upload
          </button>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading your analysis...</p>
      </main>
    );
  }

  const hasBoth = result.resume && result.linkedin;
  const analyses: { analysis: SingleAnalysis; isResume: boolean }[] = [];
  if (result.resume) analyses.push({ analysis: result.resume, isResume: true });
  if (result.linkedin) analyses.push({ analysis: result.linkedin, isResume: false });

  return (
    <main className="min-h-screen bg-slate-950 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          New Analysis
        </button>

        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isUnlocked ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-indigo-600/10 border border-indigo-500/20'} mb-6`}>
            {isUnlocked ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
            <span className={`text-sm font-medium ${isUnlocked ? 'text-emerald-300' : 'text-indigo-300'}`}>
              {isUnlocked ? 'Detailed Report – Unlocked' : 'Analysis Complete'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {isUnlocked ? 'Your Complete ATS Scorecard' : 'Your ATS Scorecard'}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            {isUnlocked
              ? 'Full analysis with all red flags, job role potential, skills gap analysis, and AI-optimized resume.'
              : hasBoth
              ? 'Here\'s how your resume and LinkedIn profile compare against ATS filters'
              : 'Here\'s what\'s holding your profile back from landing interviews'}
          </p>
        </div>

        <div className={`grid gap-6 mb-12 ${hasBoth ? 'lg:grid-cols-2' : 'max-w-xl mx-auto'}`}>
          {analyses.map(({ analysis, isResume }) => (
            <AnalysisColumn key={analysis.source} analysis={analysis} isResume={isResume} isUnlocked={isUnlocked} />
          ))}
        </div>

        {!isUnlocked ? (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
                <Lock className="w-4 h-4 text-rose-400" />
                <span className="text-sm text-rose-300 font-medium">Red Flags Locked</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Get Your Full Report & Optimized Resume</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Unlock every red flag with fixes, your ATS-perfect resume, and a detailed PDF report.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-emerald-500/40 rounded-3xl p-8 md:p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <Zap className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Full Report & Optimized Resume</h3>
              <p className="text-slate-400 mb-6">One-time unlock · instant access after payment</p>

              <div className="mb-8">
                <span className="text-5xl font-bold text-white">₹{PLAN_DEFINITIONS.quick.price}</span>
                <span className="text-slate-500 text-sm"> one-time</span>
              </div>

              <ul className="space-y-3 mb-8 max-w-sm mx-auto text-left">
                {[
                  'All red flag details & step-by-step fixes',
                  'ATS-perfect optimized resume (downloadable PDF)',
                  'Full detailed report (PDF download)',
                  'Job role potential & salary insights',
                  'Skills gap & keyword analysis',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleQuickFixPurchase}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                GET FULL REPORT AND OPTIMIZED RESUME
              </button>
              <p className="text-slate-500 text-xs mt-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Secure Razorpay payment · 30-day money-back guarantee
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-12 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300 font-medium">Your ATS-Perfect Resume</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">AI-Optimized Resume</h2>
                <p className="text-slate-400">AI-rewritten to pass ATS filters. Preview and download.</p>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8">
                {generatingResume && !resumePdfUrl && (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
                      <p className="text-white font-medium">Generating optimized resume PDF...</p>
                      <p className="text-slate-500 text-sm mt-1">This may take a moment</p>
                    </div>
                  </div>
                )}

                {resumePdfUrl && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold text-lg">Resume Preview</h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPreviewMode(!previewMode)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {previewMode ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        <button
                          onClick={handleDownloadResume}
                          disabled={downloadingResume}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                        >
                          {downloadingResume ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download Optimized Resume
                        </button>
                      </div>
                    </div>

                    {previewMode && (
                      <div className="rounded-xl overflow-hidden border border-slate-700 bg-white">
                        <iframe
                          src={resumePdfUrl}
                          className="w-full h-[700px]"
                          title="ATS-Perfect Resume Preview"
                        />
                      </div>
                    )}
                  </div>
                )}

                {!generatingResume && !resumePdfUrl && (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">
                      {id
                        ? 'Your optimized resume could not be loaded. Make sure your payment was completed, then refresh the page.'
                        : 'Your optimized resume was not generated. Please refresh the page.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mb-12">
              <button
                onClick={handleDownloadReport}
                disabled={downloadingReport}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
              >
                {downloadingReport ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                Download Full Detailed Report PDF
              </button>
            </div>

            <div className="border-t border-slate-800 pt-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-300 font-medium">Want even more?</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Upgrade for Pro Features</h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                  Cover letters, job-specific optimizations, LinkedIn review, career roadmap, and more.
                </p>
                {status !== 'authenticated' && (
                  <p className="text-xs text-slate-400 mt-2">
                    Sign up (or sign in) and your Pro plan checkout will open automatically.
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-500/50 rounded-3xl p-8 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-current" />
                      Most Popular
                    </div>
                  </div>
                  <div className="text-center mb-6 mt-2">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Pro Bundle</h3>
                    <p className="text-slate-500 text-sm">Complete optimization for 3 months</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{PLAN_DEFINITIONS.pro.price}</span>
                    <span className="text-slate-500 text-sm">{' /3 months'}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {['AI resume rewrite (5/month)', 'Cover letter generator', 'LinkedIn profile review', '5 tailored resumes', 'Priority email support'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanPurchase('pro-bundle')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    Get Pro Bundle
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">VIP Mentorship</h3>
                    <p className="text-slate-500 text-sm">1-on-1 career coaching</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{PLAN_DEFINITIONS.vip.price}</span>
                    <span className="text-slate-500 text-sm">{' /3 months'}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {['Everything in Pro', '3 mentoring sessions', 'Career roadmap', 'Interview prep', 'Salary negotiation', 'Unlimited support'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanPurchase('vip-mentorship')}
                    className="w-full py-3 rounded-xl bg-slate-800 text-white border border-slate-700 font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    Upgrade to VIP
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                30-day money-back guarantee on all plans
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
