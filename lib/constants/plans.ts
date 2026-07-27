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
    features: ['1 ATS scan/month', 'Blurred red flags', 'Basic analysis'],
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
    limits: {
      resumes: 3,
      scansPerMonth: 999,
      jobMatches: 20,
      tailoredResumes: 0,
      roadmaps: 1,
      portfolio: false,
      aiInterviews: 0,
      coldEmails: 0,
    },
    features: [
      'Full ATS unlock',
      'PDF report download',
      'Red flag fixes',
      '1 roadmap generation',
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
    limits: {
      resumes: 999,
      scansPerMonth: 999,
      jobMatches: 100,
      tailoredResumes: 5,
      roadmaps: 3,
      portfolio: true,
      aiInterviews: 3,
      coldEmails: 0,
    },
    features: [
      'AI resume rewrite (5/month)',
      'Cover letter generator',
      'LinkedIn review',
      'Job match analyzer (100/month)',
      '5 tailored resumes/month',
      '3 roadmaps',
      'Portfolio builder',
      '3 AI mock interviews/month',
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
      'Everything in Pro',
      'Unlimited tailored resumes',
      'Unlimited AI mock interviews',
      'Cold email engine',
      '3× 1-on-1 mentoring sessions',
      '24/7 AI mentor chat',
      'Salary negotiation coaching',
      'Recruiter outreach strategy',
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