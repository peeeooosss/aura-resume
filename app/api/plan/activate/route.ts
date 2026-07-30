import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { getInitialCredits } from '@/lib/constants/credits';

const VALID_PLANS = ['quick', 'pro', 'vip'] as const;

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { plan } = body;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be quick, pro, or vip' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { plan },
    });

    await prisma.creditBalance.upsert({
      where: { userId },
      create: { userId, balance: getInitialCredits(plan) },
      update: { balance: getInitialCredits(plan) },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Plan activation error:', error);
    return NextResponse.json({ error: 'Failed to activate plan' }, { status: 500 });
  }
}
