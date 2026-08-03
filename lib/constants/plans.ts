export const PLAN_DEFINITIONS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '/month',
    monthlyEquiv: '₹0/month',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    credits: 50,
    limits: {
      resumes: 1,
      scansPerMonth: 1,
      jobMatches: 5,
      tailoredResumes: 0,
      roadmaps: 0,
      portfolio: false,
      aiInterviews: 0,
      coldEmails: 0,
    },
    features: ['50 credits one-time', '1 ATS scan', '5 job searches', 'Basic analysis'],
  },
  quick: {
    id: 'quick',
    name: 'Quick Fix',
    price: 49,
    period: 'one-time',
    monthlyEquiv: '₹49 one-time',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    credits: 200,
    limits: {
      resumes: 3,
      scansPerMonth: 999,
      jobMatches: 20,
      tailoredResumes: 0,
      roadmaps: 0,
      portfolio: false,
      aiInterviews: 0,
      coldEmails: 0,
    },
    features: [
      '200 credits one-time',
      'Full ATS unlock',
      'PDF report download',
      'Red flag fixes',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Bundle',
    price: 499,
    period: '/3 months',
    monthlyEquiv: '~₹166/month',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    credits: 900,
    limits: {
      resumes: 999,
      scansPerMonth: 999,
      jobMatches: 999,
      tailoredResumes: 999,
      roadmaps: 999,
      portfolio: false,
      aiInterviews: 0,
      coldEmails: 0,
    },
    features: [
      '900 credits for 3 months',
      'AI resume rewrite',
      'Cover letter generator',
      'LinkedIn review',
      'Job match analyzer',
      'Tailored resumes',
      '90-day roadmap',
      'Priority email support',
    ],
  },
  vip: {
    id: 'vip',
    name: 'VIP Mentorship',
    price: 1499,
    period: '/3 months',
    monthlyEquiv: '~₹499/month',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    credits: 1800,
    limits: {
      resumes: 999,
      scansPerMonth: 999,
      jobMatches: 999,
      tailoredResumes: 999,
      roadmaps: 999,
      portfolio: true,
      aiInterviews: 999,
      coldEmails: 999,
    },
    features: [
      '1,800 credits for 3 months',
      'Everything in Pro',
      'Unlimited AI mock interviews',
      'Cold email engine',
      'Portfolio builder',
      '3× 1-on-1 mentoring sessions',
      '24/7 AI mentor chat',
      'Salary negotiation coaching',
      'Unlimited support',
    ],
  },
} as const;

export type PlanId = keyof typeof PLAN_DEFINITIONS;
export type PlanDefinition = typeof PLAN_DEFINITIONS[PlanId];

export function getPlanDefinition(planId: PlanId): PlanDefinition {
  return PLAN_DEFINITIONS[planId] || PLAN_DEFINITIONS.free;
}

export function canAccessFeature(
  userPlan: PlanId,
  requiredPlan: PlanId
): boolean {
  const planOrder: PlanId[] = ['free', 'quick', 'pro', 'vip'];
  return planOrder.indexOf(userPlan) >= planOrder.indexOf(requiredPlan);
}

export function getPlanLimit(userPlan: PlanId, limitKey: keyof PlanDefinition['limits']) {
  return PLAN_DEFINITIONS[userPlan]?.limits[limitKey] ?? 0;
}