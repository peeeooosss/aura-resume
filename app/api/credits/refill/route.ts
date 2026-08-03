import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { getRefillPrice, REFILL_OPTIONS } from '@/lib/constants/credits';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== 'number' || !REFILL_OPTIONS.some((o) => o.amount === amount)) {
      return NextResponse.json(
        { error: 'Invalid refill amount. Choose 50, 100, 200, or 500 credits.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const plan = (user?.plan as string) || 'free';
    const price = getRefillPrice(plan, amount);

    if (!price) {
      return NextResponse.json({ error: 'Refill not available for your plan' }, { status: 403 });
    }

    const balance = await prisma.$transaction(async (tx) => {
      const updated = await tx.creditBalance.upsert({
        where: { userId },
        create: { userId, balance: amount },
        update: { balance: { increment: amount } },
      });

      await tx.payment.create({
        data: {
          userId,
          amount: price,
          currency: 'INR',
          plan: 'credit_refill',
          status: 'completed',
          metadata: { type: 'credit_topup', credits: amount, refillPrice: price },
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      creditsAdded: amount,
      price,
      balance: balance.balance,
    });
  } catch (error) {
    console.error('Credit refill error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Refill failed' },
      { status: 500 }
    );
  }
}
