import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'demo-user';

  const balance = await prisma.creditBalance.upsert({
    where: { userId },
    create: { userId, balance: 100 },
    update: {},
  });

  return NextResponse.json({ balance: balance.balance });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, amount, source } = body;

  if (!userId || !amount) {
    return NextResponse.json({ error: 'userId and amount required' }, { status: 400 });
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
}