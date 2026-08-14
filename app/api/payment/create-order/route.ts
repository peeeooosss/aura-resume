import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth/getSessionUser';
import { prisma } from '@/lib/db';
import Razorpay from 'razorpay';
import { getPlanBySlug } from '@/lib/constants/plans';
import { getRefillPrice } from '@/lib/constants/credits';
import { resolvePlanValidity } from '@/lib/billing';

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

if (!KEY_ID || !KEY_SECRET) {
  console.warn('[RazorPay] Keys not configured. Payment will fail.');
}

const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();

    let amount: number;
    let plan: string;
    let metadata: Record<string, unknown>;

    const type = body.type === 'refill' ? 'refill' : 'plan';

    if (type === 'refill') {
      if (!userId) {
        return NextResponse.json({ error: 'Please sign in to refill credits' }, { status: 401 });
      }

      const credits = Number(body.credits);
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
      const currentPlan = await resolvePlanValidity(userId, (user?.plan as string) || 'free');

      if (currentPlan === 'free') {
        return NextResponse.json({ error: 'Credit refills require a paid plan' }, { status: 403 });
      }

      const price = getRefillPrice(currentPlan, credits);

      if (!credits || credits <= 0 || !price) {
        return NextResponse.json({ error: 'Invalid refill amount' }, { status: 400 });
      }

      amount = price * 100;
      plan = 'credit_refill';
      metadata = { type: 'refill', credits };
    } else {
      const slug = (body.plan as string) || 'quick-fix';
      const def = getPlanBySlug(slug);

      if (!def || def.price <= 0) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }

      amount = def.price * 100;
      plan = def.id;
      metadata = { type: 'plan', planId: def.id, slug };
    }

    let paymentUserId: string;

    if (plan === 'quick') {
      const guest = (body.guest || {}) as { name?: string; email?: string; phone?: string };
      const name = (guest.name || '').trim();
      const email = (guest.email || '').trim().toLowerCase();
      const phone = (guest.phone || '').trim();

      if (!name || !email || !EMAIL_RE.test(email) || !/^\d{10}$/.test(phone)) {
        return NextResponse.json(
          { error: 'Please provide a valid name, email, and 10-digit phone number' },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        paymentUserId = existing.id;
      } else {
        const created = await prisma.user.create({
          data: { email, name, plan: 'free', onboarded: false },
        });
        paymentUserId = created.id;
      }

      metadata = { ...metadata, guest: true, guestName: name, guestEmail: email, guestPhone: phone };
    } else if (userId) {
      paymentUserId = userId;
    } else {
      return NextResponse.json({ error: 'Please sign in to purchase this plan' }, { status: 401 });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${paymentUserId.slice(0, 8)}_${Date.now()}`,
      notes: { userId: paymentUserId, plan, ...metadata },
    });

    await prisma.payment.create({
      data: {
        userId: paymentUserId,
        razorpayId: order.id,
        amount,
        currency: 'INR',
        plan,
        status: 'created',
        metadata: { ...metadata, orderId: order.id },
      },
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