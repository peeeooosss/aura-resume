import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import Razorpay from 'razorpay';

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

if (!KEY_ID || !KEY_SECRET) {
  console.warn('[RazorPay] Keys not configured. Payment will fail.');
}

const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

const PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  quick: { amount: 4900, label: 'Quick Fix' },
  pro: { amount: 49900, label: 'Pro Bundle' },
  vip: { amount: 149900, label: 'VIP Mentorship' },
};

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const plan = (body.plan as string) || 'quick';
    const customAmount = body.amount ? Number(body.amount) : undefined;

    const planConfig = PLAN_PRICES[plan];
    if (!planConfig && !customAmount) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const amount = customAmount || planConfig.amount;
    const notes = {
      userId,
      plan,
      label: planConfig?.label || plan,
    };

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${userId.slice(0, 8)}_${Date.now()}`,
      notes,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: KEY_ID,
    });
  } catch (error) {
    console.error('[RazorPay] Create order failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}
