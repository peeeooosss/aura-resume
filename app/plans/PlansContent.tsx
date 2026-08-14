'use client';

import { Fragment, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Shield, Download, Sparkles as SparklesIcon, Users, Star, X, Check, Lock, Zap } from 'lucide-react';
import { PLAN_DEFINITIONS, type PlanId } from '@/lib/constants/plans';

function FeatureIcon({ value }: { value: any }) {
  if (value === true) return <Check className="w-5 h-5 text-emerald-400" />;
  if (value === false) return <X className="w-5 h-5 text-slate-600" />;
  if (value === 'blurred') return <Lock className="w-5 h-5 text-slate-500" />;
  if (typeof value === 'number') return <span className="text-emerald-400 font-semibold">{value}/mo</span>;
  if (typeof value === 'string') return <span className="text-emerald-400 font-semibold text-sm">{value}</span>;
  return <X className="w-5 h-5 text-slate-600" />;
}

const PLAN_DISPLAY = [
  {
    id: 'free' as PlanId,
    icon: Shield,
    badge: null,
  },
  {
    id: 'quick' as PlanId,
    icon: Zap,
    badge: { label: 'Instant', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  },
  {
    id: 'pro' as PlanId,
    icon: SparklesIcon,
    badge: { label: 'Most Popular', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  },
  {
    id: 'vip' as PlanId,
    icon: Users,
    badge: { label: 'Premium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  },
];

const features = [
  {
    category: 'Core Analysis',
    items: [
      { key: 'atsScan', label: 'ATS compatibility scan' },
      { key: 'redFlags', label: 'Red flag detection' },
      { key: 'redFlagDetails', label: 'Detailed red flag fixes' },
      { key: 'pdfReport', label: 'PDF report download' },
    ],
  },
  {
    category: 'AI-Powered Tools',
    items: [
      { key: 'aiRewrite', label: 'AI resume rewrite' },
      { key: 'coverLetter', label: 'Cover letter generator' },
      { key: 'linkedinReview', label: 'LinkedIn profile review' },
      { key: 'aiInterviewer', label: 'AI mock interviewer' },
      { key: 'jobMatch', label: 'Job match analyzer' },
      { key: 'jobRoadmap', label: 'Personalized job roadmap' },
    ],
  },
  {
    category: 'Premium Features',
    items: [
      { key: 'mentoring', label: '1-on-1 mentoring sessions' },
      { key: 'salaryNegotiation', label: 'Salary negotiation coaching' },
      { key: 'recruiterOutreach', label: 'Recruiter outreach strategy' },
      { key: 'prioritySupport', label: 'Priority email support' },
      { key: 'unlimitedSupport', label: 'Unlimited support' },
    ],
  },
];

function getFeatureValue(planId: string, featureKey: string) {
  const matrix: Record<string, Record<string, any>> = {
    free: {
      atsScan: 1,
      redFlags: 'blurred',
      redFlagDetails: false,
      pdfReport: false,
      aiRewrite: false,
      coverLetter: false,
      linkedinReview: false,
      aiInterviewer: false,
      jobMatch: false,
      jobRoadmap: false,
      mentoring: false,
      salaryNegotiation: false,
      recruiterOutreach: false,
      prioritySupport: false,
      unlimitedSupport: false,
    },
    quick: {
      atsScan: true,
      redFlags: true,
      redFlagDetails: true,
      pdfReport: true,
      aiRewrite: 1,
      coverLetter: false,
      linkedinReview: false,
      aiInterviewer: false,
      jobMatch: false,
      jobRoadmap: false,
      mentoring: false,
      salaryNegotiation: false,
      recruiterOutreach: false,
      prioritySupport: false,
      unlimitedSupport: false,
    },
    pro: {
      atsScan: true,
      redFlags: true,
      redFlagDetails: true,
      pdfReport: true,
      aiRewrite: 5,
      coverLetter: true,
      linkedinReview: true,
      aiInterviewer: false,
      jobMatch: true,
      jobRoadmap: 'Basic',
      mentoring: false,
      salaryNegotiation: false,
      recruiterOutreach: false,
      prioritySupport: true,
      unlimitedSupport: false,
    },
    vip: {
      atsScan: true,
      redFlags: true,
      redFlagDetails: true,
      pdfReport: true,
      aiRewrite: 'Unlimited',
      coverLetter: true,
      linkedinReview: true,
      aiInterviewer: 'Unlimited',
      jobMatch: true,
      jobRoadmap: 'Personalized',
      mentoring: 3,
      salaryNegotiation: true,
      recruiterOutreach: true,
      prioritySupport: true,
      unlimitedSupport: true,
    },
  };
  return matrix[planId]?.[featureKey] ?? false;
}

export default function PlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightPlan = searchParams.get('plan') || 'pro';

  const handleActivatePlan = (planId: string) => {
    const def = PLAN_DEFINITIONS[planId as PlanId];
    if (!def) return;

    if (planId === 'free') {
      router.push('/');
      return;
    }

    router.push(`/payment?plan=${def.slug}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">Choose Your Career Upgrade</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Subscription Plans</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Billed securely via Razorpay. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-7xl mx-auto">
          {PLAN_DISPLAY.map((plan) => {
            const def = PLAN_DEFINITIONS[plan.id];
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative group transition-all duration-300 ${plan.id === highlightPlan ? 'ring-2 ring-indigo-500/50 scale-[1.02] z-10' : ''} ${def.bgColor} border ${def.borderColor} rounded-3xl p-6 md:p-8 flex flex-col`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${plan.badge.color}`}>
                      {plan.badge.label}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${def.bgColor} border ${def.borderColor}`}>
                    <Icon className={`w-7 h-7 ${def.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{def.name}</h3>
                  <p className="text-slate-500 text-sm">
                    {plan.id === 'free' ? 'Free forever' : plan.id === 'quick' ? 'One-time payment' : 'Quarterly subscription'}
                  </p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-white">₹{def.price}</span>
                  <span className="text-slate-500 text-sm ml-2">{def.period}</span>
                  <div className="mt-2 text-xs text-slate-500">{def.monthlyEquiv}</div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    { key: 'atsScan', label: 'ATS scan & red flags' },
                    { key: 'pdfReport', label: 'PDF report download' },
                    { key: 'aiRewrite', label: 'AI resume rewrite' },
                    { key: 'coverLetter', label: 'Cover letter generator' },
                    { key: 'linkedinReview', label: 'LinkedIn review' },
                    { key: 'aiInterviewer', label: 'AI mock interviews' },
                    { key: 'jobMatch', label: 'Job match analyzer' },
                    { key: 'jobRoadmap', label: 'Job roadmap' },
                    { key: 'mentoring', label: '1-on-1 mentoring' },
                    { key: 'prioritySupport', label: 'Priority support' },
                  ].map((f) => (
                    <li key={f.key} className="flex items-center gap-3 text-slate-300 text-sm">
                      <FeatureIcon value={getFeatureValue(plan.id, f.key)} />
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleActivatePlan(plan.id)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.id === 'free'
                      ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
                      : plan.id === 'quick'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                      : plan.id === 'pro'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                      : 'bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:shadow-lg hover:shadow-amber-500/30'
                  }`}
                >
                  {plan.id === 'free' ? 'Start Free' : plan.id === 'quick' ? 'Get Quick Fix' : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-6 font-semibold text-slate-400">Feature</th>
                  {PLAN_DISPLAY.map((p) => {
                    const def = PLAN_DEFINITIONS[p.id];
                    const Icon = p.icon;
                    return (
                      <th key={p.id} className="text-center py-4 px-4 font-semibold text-white">
                        <div className="flex items-center justify-center gap-2">
                          <Icon className={`w-5 h-5 ${def.color}`} />
                          <span>{def.name}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {features.map((cat) => (
                  <Fragment key={cat.category}>
                    <tr className="border-b border-slate-800/50">
                      <td className="py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/50" colSpan={5}>{cat.category}</td>
                    </tr>
                    {cat.items.map((item) => (
                      <tr key={item.key} className="border-b border-slate-800/30 hover:bg-slate-900/30">
                        <td className="py-4 px-6 text-slate-300">{item.label}</td>
                        {PLAN_DISPLAY.map((p) => (
                          <td key={p.id} className="py-4 px-4 text-center">
                            <FeatureIcon value={getFeatureValue(p.id, item.key)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
            <Shield className="w-4 h-4 text-rose-400" />
            <span className="text-sm text-rose-300 font-medium">30-Day Money-Back Guarantee</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Try Risk-Free</h3>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Not satisfied? Get a full refund within 30 days. No questions asked.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleActivatePlan('pro')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              <Download className="w-5 h-5" />
              Get Started with Pro
            </button>
            <button
              onClick={() => handleActivatePlan('vip')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <Star className="w-5 h-5" />
              Upgrade to VIP
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
