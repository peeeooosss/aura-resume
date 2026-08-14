import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getInitialCredits } from '@/lib/constants/credits';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { resolvePlanValidity } from '@/lib/billing';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const storedPlan = (user?.plan as string) || 'free';
    const plan = await resolvePlanValidity(userId, storedPlan);

    const balance = await prisma.creditBalance.upsert({
      where: { userId },
      create: { userId, balance: getInitialCredits(plan) },
      update: {},
    });

    return NextResponse.json({ balance: balance.balance, plan });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    );
  }
}
