'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Check, Shield, FileText, Download, Sparkles, Zap, Users, ArrowRight, Star, Lock, Target, Loader2, Eye } from 'lucide-react';
import { generateAnalysisPDF, generateOptimizedResumePDF, getPDFBlobURL, type AnalysisReportData } from '@/lib/pdf/generateReport';
import type { DualAnalysisResult, SingleAnalysis, JobRolePotential } from '@/lib/types';
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

function UnlockedSection({
  title,
  icon: Icon,
  colorClass,
  bgClass,
  borderClass,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className={`flex items-center gap-2 text-sm font-bold ${colorClass} mb-4`}>
        <div className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
        {title}
        <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
          <Shield className="w-2.5 h-2.5" />
          Unlocked
        </span>
      </h3>
      {children}
    </div>
  );
}

function JobRolePotentialDisplay({ potential }: { potential: JobRolePotential }) {
  return (
    <div className="space-y-4">
      <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
        <h4 className="text-indigo-400 font-semibold text-sm mb-4">Top Matching Roles</h4>
        <div className="space-y-3">
          {potential.potentialRoles.slice(0, 5).map((role, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div>
                <p className="text-white font-medium text-sm">{role.title}</p>
                <p className="text-slate-400 text-xs">{role.company}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {role.requiredSkills.slice(0, 3).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-indigo-400 font-bold text-lg">{role.matchScore}%</p>
                <p className="text-emerald-400 text-xs font-medium">{role.salaryRange}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
        <h4 className="text-indigo-400 font-semibold text-sm mb-4">Skills Gap Analysis</h4>
        <div className="space-y-2">
          {potential.skillsGap.map((gap, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <span className="text-white text-sm">{gap.skill}</span>
                <span className="text-slate-500 text-xs ml-2">{gap.currentLevel} → {gap.targetLevel}</span>
              </div>
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

      <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
        <h4 className="text-indigo-400 font-semibold text-sm mb-3">Salary Potential</h4>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
          <div className="text-left">
            <p className="text-slate-400 text-xs">Average</p>
            <p className="text-emerald-400 font-bold text-2xl">{potential.salaryRange.average}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">Range</p>
            <p className="text-white font-semibold">{potential.salaryRange.minimum} - {potential.salaryRange.maximum}</p>
          </div>
        </div>
      </div>

      {potential.matchReasoning && (
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <p className="text-slate-400 text-xs leading-relaxed">{potential.matchReasoning}</p>
        </div>
      )}
    </div>
  );
}

export default function ReportContent({ id }: { id: string }) {
  const router = useRouter();
  const { status } = useSession();
  const [result, setResult] = useState<DualAnalysisResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [resumePdfUrl, setResumePdfUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const resumeGeneratedRef = useRef(false);

  useEffect(() => {
    const unlocked = localStorage.getItem(`aura-unlocked-${id}`);
    if (!unlocked) {
      router.replace(`/results?id=${id}`);
      return;
    }
    setIsUnlocked(true);

    const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
    const stored = analyses[id];

    if (!stored) {
      router.replace(`/results?id=${id}`);
      return;
    }

    stored.id = id;
    setResult(stored);
    setLoading(false);
  }, [id, router]);

  const generateResumePDF = useCallback(async () => {
    if (!result || resumeGeneratedRef.current) return;
    resumeGeneratedRef.current = true;
    setGeneratingResume(true);

    try {
      const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
      let optimizedText = analyses[id]?.optimizedResumeText;

      if (!optimizedText && result.resume?.originalText) {
        if (status !== 'authenticated') {
          const currentUrl = `${window.location.pathname}${window.location.search}`;
          router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
          return;
        }
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
        analyses[id].optimizedResumeText = optimizedText;
        localStorage.setItem('aura-analyses', JSON.stringify(analyses));
        useCreditsStore.getState().refresh();
      }

      if (!optimizedText) {
        console.error('No resume text to generate PDF from');
        return;
      }

      const doc = generateOptimizedResumePDF(optimizedText, {
        generatedAt: new Date().toLocaleString(),
      });

      const url = getPDFBlobURL(doc);
      setResumePdfUrl(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setGeneratingResume(false);
    }
  }, [result, id, status, router]);

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
    if (!result) return;
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
      doc.save(`ATS-Perfect-Resume-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Resume PDF download failed:', error);
    } finally {
      setDownloadingResume(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading your detailed report...</p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">Report not found.</p>
          <button onClick={() => router.push('/')} className="text-indigo-400 hover:text-indigo-300 underline">
            Go back home
          </button>
        </div>
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
          Home
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-medium">Detailed Report – Unlocked</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Your Complete ATS Scorecard</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Full analysis with all red flags, job role potential, skills gap analysis, and AI-optimized resume.
          </p>
        </div>

        <div className={`grid gap-6 mb-12 ${hasBoth ? 'lg:grid-cols-2' : 'max-w-xl mx-auto'}`}>
          {analyses.map(({ analysis, isResume }) => {
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
                  icon: FileText,
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

            return (
              <div key={analysis.source} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl ${sourceConfig.bgClass} border ${sourceConfig.borderClass} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${sourceConfig.textClass}`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${sourceConfig.textClass}`}>{sourceConfig.label}</h2>
                    <p className="text-slate-500 text-xs">Full unlocked report</p>
                  </div>
                </div>

                <ScoreCircle score={analysis.score} />

                <UnlockedSection
                  title="Strengths"
                  icon={Shield}
                  colorClass="text-emerald-500"
                  bgClass="bg-emerald-500/10"
                  borderClass="border-emerald-500/20"
                >
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
                </UnlockedSection>

                <UnlockedSection
                  title="Critical Red Flags"
                  icon={Lock}
                  colorClass="text-rose-500"
                  bgClass="bg-rose-500/10"
                  borderClass="border-rose-500/20"
                >
                  <div className="space-y-2">
                    {analysis.redFlags.map((flag, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 ${sourceConfig.flagBg} rounded-xl border ${sourceConfig.flagBorder}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-2" />
                        <p className="text-rose-50 font-medium text-sm leading-snug">{flag}</p>
                      </div>
                    ))}
                  </div>
                </UnlockedSection>

                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <UnlockedSection
                    title="Improvement Suggestions"
                    icon={Sparkles}
                    colorClass="text-amber-500"
                    bgClass="bg-amber-500/10"
                    borderClass="border-amber-500/20"
                  >
                    <div className="space-y-2">
                      {analysis.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                          <p className="text-amber-50 font-medium text-sm leading-snug">{s}</p>
                        </div>
                      ))}
                    </div>
                  </UnlockedSection>
                )}

                {analysis.keywordGaps && analysis.keywordGaps.length > 0 && (
                  <UnlockedSection
                    title="Keyword Gaps"
                    icon={Target}
                    colorClass="text-blue-500"
                    bgClass="bg-blue-500/10"
                    borderClass="border-blue-500/20"
                  >
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordGaps.map((gap, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </UnlockedSection>
                )}

                {analysis.jobRolePotential && isResume && (
                  <UnlockedSection
                    title="Job Role Potential"
                    icon={Target}
                    colorClass="text-indigo-500"
                    bgClass="bg-indigo-500/10"
                    borderClass="border-indigo-500/20"
                  >
                    <JobRolePotentialDisplay potential={analysis.jobRolePotential} />
                  </UnlockedSection>
                )}
              </div>
            );
          })}
        </div>

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
                      Download Resume PDF
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
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center gap-4 text-slate-300 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-indigo-400" />
                      <span>Pro Bundle - ₹{PLAN_DEFINITIONS.pro.price}/3 months</span>
                    </div>
                    <div className="w-px h-8 bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>VIP Mentorship - ₹{PLAN_DEFINITIONS.vip.price}/3 months</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm">
                    AI resume rewrites, cover letters, LinkedIn review, career roadmap,
                    interview prep, salary negotiation, and 1-on-1 mentoring.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  GET STARTED
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-slate-500 text-xs mt-3">
                  Redirects to login to access Pro & VIP features
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
