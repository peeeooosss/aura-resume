export const CREDIT_COSTS = {
  resume_analysis: 25,
  linkedin_analysis: 30,
  job_search: 10,
  cover_letter: 20,
  roadmap_generation: 30,
  resume_fix: 15,
  ai_interview: 50,
  cold_email: 15,
  job_match: 20,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export const REFILL_OPTIONS = [
  { amount: 50, proPrice: 49, vipPrice: 79 },
  { amount: 100, proPrice: 99, vipPrice: 149 },
  { amount: 200, proPrice: 189, vipPrice: 289 },
  { amount: 500, proPrice: 449, vipPrice: 699 },
] as const;

export const REFILL_THRESHOLD = 50;

export function getCreditCost(action: CreditAction): number {
  return CREDIT_COSTS[action];
}

export function getRefillOptions(plan: string) {
  return REFILL_OPTIONS.map((option) => ({
    amount: option.amount,
    price: plan === 'vip' ? option.vipPrice : option.proPrice,
  }));
}

export function getRefillPrice(plan: string, amount: number): number | null {
  const option = REFILL_OPTIONS.find((o) => o.amount === amount);
  if (!option) return null;
  return plan === 'vip' ? option.vipPrice : option.proPrice;
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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = (user?.plan as string) || 'free';

  const balance = await prisma.creditBalance.upsert({
    where: { userId },
    create: { userId, balance: getInitialCredits(plan) },
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
      return 25;
    case 'quick':
      return 150;
    case 'pro':
      return 900;
    case 'vip':
      return 1800;
    default:
      return 100;
  }
}
