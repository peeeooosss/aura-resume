import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getInitialCredits } from '@/lib/constants/credits';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const plan = (user?.plan as string) || 'free';

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

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { amount, source } = body;

    if (!amount) {
      return NextResponse.json({ error: 'amount required' }, { status: 400 });
    }

    const balance = await prisma.creditBalance.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: 'INR',
        plan: source || 'credit_purchase',
        status: 'completed',
        metadata: { type: 'credit_topup', source },
      },
    });

    return NextResponse.json({ balance: balance.balance });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update credits' },
      { status: 401 }
    );
  }
}
