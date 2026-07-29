export const CREDIT_COSTS = {
  resume_analysis: 5,
  linkedin_analysis: 10,
  job_search: 2,
  cover_letter: 5,
  roadmap_generation: 10,
  resume_fix: 3,
  ai_interview: 8,
  cold_email: 3,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export function getCreditCost(action: CreditAction): number {
  return CREDIT_COSTS[action];
}

export async function deductCredits(userId: string, action: CreditAction): Promise<number> {
  const cost = getCreditCost(action);
  const { prisma } = await import('@/lib/db');

  const balance = await prisma.creditBalance.update({
    where: { userId },
    data: { balance: { decrement: cost } },
  });

  if (balance.balance < 0) {
    throw new Error('Insufficient credits');
  }

  return balance.balance;
}

export async function getCreditBalance(userId: string): Promise<number> {
  const { prisma } = await import('@/lib/db');

  const balance = await prisma.creditBalance.upsert({
    where: { userId },
    create: { userId, balance: 100 },
    update: {},
  });

  return balance.balance;
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const { prisma } = await import('@/lib/db');

  const balance = await prisma.creditBalance.update({
    where: { userId },
    data: { balance: { increment: amount } },
  });

  return balance.balance;
}

export function getInitialCredits(plan: string): number {
  switch (plan) {
    case 'free':
      return 50;
    case 'quick':
      return 200;
    case 'pro':
      return 900;
    case 'vip':
      return 1800;
    default:
      return 100;
  }
}