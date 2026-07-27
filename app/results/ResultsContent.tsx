'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Lock, Shield, ArrowLeft, Download, Sparkles, FileText, Linkedin as LinkedinIcon, Link, Star, Zap, Users, Award, ArrowRight } from 'lucide-react';
import type { DualAnalysisResult, SingleAnalysis } from '@/lib/types';
import { generateMockAnalysis } from '@/lib/mockData';

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

function ScoreCircle({ score, colorClass }: { score: number; colorClass: string }) {
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

function AnalysisColumn({ analysis, isResume }: { analysis: SingleAnalysis; isResume: boolean }) {
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
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
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
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      };

  const Icon = sourceConfig.icon;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl ${sourceConfig.bgClass} border ${sourceConfig.borderClass} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${sourceConfig.textClass}`} />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${sourceConfig.textClass}`}>{sourceConfig.label}</h2>
          <p className="text-slate-500 text-xs">Score breakdown</p>
        </div>
      </div>

      <ScoreCircle score={analysis.score} colorClass={sourceConfig.textClass} />

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

      <div className="relative">
        <h3 className="flex items-center gap-2 text-sm font-bold text-rose-500 mb-4">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-rose-500" />
          </div>
          Critical Red Flags
        </h3>

        <div className="relative">
          <div className="space-y-2 select-none pointer-events-none blur-[3px] opacity-50">
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
    </div>
  );
}

function PricingCard({ 
  tier, 
  price, 
  period, 
  features, 
  cta, 
  highlighted = false, 
  badge,
  onClick 
}: {
  tier: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: { label: string; icon: React.ReactNode };
  onClick: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={`relative group cursor-pointer transition-all duration-300 ${
        highlighted
          ? 'bg-slate-900/90 border-2 border-indigo-500/50 rounded-3xl p-6 md:p-8 shadow-2xl shadow-indigo-500/20'
          : 'bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50'
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5">
            {badge.icon}
            {badge.label}
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
          highlighted ? 'bg-indigo-600/20' : 'bg-slate-800'
        }`}>
          {tier === 'Quick Fix' && <Zap className="w-6 h-6 text-emerald-400" />}
          {tier === 'Pro Bundle' && <Sparkles className="w-6 h-6 text-indigo-400" />}
          {tier === 'VIP Mentorship' && <Users className="w-6 h-6 text-amber-400" />}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{tier}</h3>
        <p className="text-slate-500 text-sm">{cta}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-slate-500 text-sm"> {period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
            <Check className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-indigo-400' : 'text-emerald-500'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          highlighted
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
            : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
        }`}
      >
        {highlighted ? (
          <>
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        ) : (
          'Get Started'
        )}
      </button>
    </div>
  );
}

interface Props {
  id?: string;
  testMode?: boolean;
}

export default function ResultsContent({ id, testMode }: Props) {
  const router = useRouter();
  const [result, setResult] = useState<DualAnalysisResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (testMode) {
      setResult(generateMockAnalysis('resume.pdf', 'linkedin.com/in/test'));
      return;
    }

    if (!id) {
      setError(true);
      return;
    }

    const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
    if (analyses[id]) {
      setResult(analyses[id]);
    } else {
      setError(true);
    }
  }, [id, testMode]);

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
  const analyses: SingleAnalysis[] = [];
  if (result.resume) analyses.push(result.resume);
  if (result.linkedin) analyses.push(result.linkedin);

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">Analysis Complete</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Your ATS Scorecard</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            {hasBoth
              ? 'Here\'s how your resume and LinkedIn profile compare against ATS filters'
              : 'Here\'s what\'s holding your profile back from landing interviews'}
          </p>
        </div>

        <div className={`grid gap-6 mb-12 ${hasBoth ? 'lg:grid-cols-2' : 'max-w-xl mx-auto'}`}>
          {analyses.map((a) => (
            <AnalysisColumn key={a.source} analysis={a} isResume={a.source === 'resume'} />
          ))}
        </div>

        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
              <Lock className="w-4 h-4 text-rose-400" />
              <span className="text-sm text-rose-300 font-medium">Critical Red Flags Locked</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Unlock Exact Errors & Fixes</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              See every red flag with step-by-step instructions to fix them. Download your personalized PDF report.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <PricingCard
              tier="Quick Fix"
              price="₹49"
              period="one-time"
              features={[
                'Full ATS compatibility scan',
                'Basic keyword analysis',
                '1-click LinkedIn import',
                'PDF report download',
                'All red flag details & fixes',
              ]}
              cta="Perfect for a quick resume check before applying"
              highlighted={false}
              onClick={() => alert('Quick Fix selected - integrate with payment')}
            />
            <PricingCard
              tier="Pro Bundle"
              price="₹499"
              period="/3 months"
              features={[
                'Everything in Quick Fix',
                'AI-powered resume rewrite',
                '5 job-specific optimizations',
                'Cover letter generator',
                'LinkedIn profile review',
                'Priority email support',
              ]}
              cta="Complete job search optimization for 3 months"
              highlighted={true}
              badge={{ label: 'Most Popular', icon: <Star className="w-4 h-4 fill-current" /> }}
              onClick={() => alert('Pro Bundle selected - integrate with payment')}
            />
            <PricingCard
              tier="VIP Mentorship"
              price="₹1,499"
              period="/3 months"
              features={[
                'Everything in Pro Bundle',
                '3 one-on-one mentoring sessions',
                'Personal career roadmap',
                'Salary negotiation coaching',
                'Interview preparation',
                'Recruiter outreach strategy',
                'Unlimited email support',
              ]}
              cta="Personal 1-on-1 career coaching & strategy"
              highlighted={false}
              onClick={() => alert('VIP Mentorship selected - integrate with payment')}
            />
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            30-day money-back guarantee on all plans
          </p>
        </div>
      </div>
    </main>
  );
}