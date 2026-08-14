export interface PlanLimits {
  resumes: number;
  scansPerMonth: number;
  jobMatches: number;
  tailoredResumes: number;
  roadmaps: number;
  portfolio: boolean;
  aiInterviews: number;
  coldEmails: number;
}

export const PLAN_DEFINITIONS = {
  free: {
    id: 'free',
    slug: 'free',
    name: 'Free',
    price: 0,
    period: '/month',
    monthlyEquiv: '₹0/month',
    duration: 'monthly' as const,
    expiresInDays: null,
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
    slug: 'quick-fix',
    name: 'Quick Fix',
    price: 1,
    period: 'one-time',
    monthlyEquiv: '₹1 one-time',
    duration: 'one-time' as const,
    expiresInDays: null,
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
    slug: 'pro-bundle',
    name: 'Pro Bundle',
    price: 1,
    period: '/3 months',
    monthlyEquiv: '₹1 for 3 months',
    duration: 'quarterly' as const,
    expiresInDays: 90,
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
    slug: 'vip-mentorship',
    name: 'VIP Mentorship',
    price: 1,
    period: '/3 months',
    monthlyEquiv: '₹1 for 3 months',
    duration: 'quarterly' as const,
    expiresInDays: 90,
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
      '3× 1-on-1 mentoring sessions',
      '24/7 AI mentor chat',
      'Salary negotiation coaching',
      'Unlimited support',
    ],
  },
} as const;

export type PlanId = keyof typeof PLAN_DEFINITIONS;
export type PlanDefinition = (typeof PLAN_DEFINITIONS)[PlanId];

export function getPlanDefinition(planId: string): PlanDefinition {
  return PLAN_DEFINITIONS[planId as PlanId] || PLAN_DEFINITIONS.free;
}

export function getPlanBySlug(slug: string): PlanDefinition | null {
  const entry = (Object.values(PLAN_DEFINITIONS) as PlanDefinition[]).find((p) => p.slug === slug);
  return entry || null;
}

export function getPlanPricePaise(planId: string): number {
  return getPlanDefinition(planId).price * 100;
}

export function getPlanExpiry(planId: string, from: Date = new Date()): Date | null {
  const days = getPlanDefinition(planId).expiresInDays;
  if (days === null) return null;
  const expires = new Date(from);
  expires.setDate(expires.getDate() + days);
  return expires;
}

export function canAccessFeature(
  userPlan: string,
  requiredPlan: string
): boolean {
  const planOrder: string[] = ['free', 'quick', 'pro', 'vip'];
  return planOrder.indexOf(userPlan) >= planOrder.indexOf(requiredPlan);
}

export function getPlanLimit(userPlan: string, limitKey: keyof PlanDefinition['limits']) {
  return PLAN_DEFINITIONS[userPlan as PlanId]?.limits[limitKey] ?? 0;
}

export const PLAN_TIER: Record<string, number> = { free: 0, quick: 1, pro: 2, vip: 3 };
