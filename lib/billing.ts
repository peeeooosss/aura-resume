import { prisma } from '@/lib/db';
import { getPlanDefinition } from '@/lib/constants/plans';

export function getPlanExpiresFromPaidAt(plan: string, paidAt: Date): Date | null {
  const def = getPlanDefinition(plan);
  if (!def || def.duration === 'one-time' || def.expiresInDays === null) return null;
  return new Date(paidAt.getTime() + def.expiresInDays * 24 * 60 * 60 * 1000);
}

export function planExpired(plan: string, paidAt: Date): boolean {
  const expiry = getPlanExpiresFromPaidAt(plan, paidAt);
  if (expiry === null) return false;
  return expiry.getTime() <= Date.now();
}

export async function resolvePlanValidity(userId: string, plan: string): Promise<string> {
  if (plan === 'free') return 'free';

  const def = getPlanDefinition(plan);
  if (!def || def.expiresInDays === null) return plan;

  const payment = await prisma.payment.findFirst({
    where: { userId, plan, status: 'completed' },
    orderBy: { createdAt: 'desc' },
  });

  if (!payment || planExpired(plan, payment.createdAt)) return 'free';
  return plan;
}

export async function getEffectivePlanForUser(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  if (!user) return 'free';
  return resolvePlanValidity(userId, user.plan);
}
