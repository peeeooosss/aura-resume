import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth/getSessionUser';
import { prisma } from '@/lib/db';
import { getPlanDefinition } from '@/lib/constants/plans';
import { generateATSPerfectResume } from '@/lib/ai/openrouter';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      resumeText,
      analysis,
      fileName,
      guestEmail,
    } = body;

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      console.error('[RazorPay] Signature mismatch');
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { razorpayId: orderId } });
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 400 });
    }

    const meta = (payment.metadata as Record<string, any>) || {};
    let payUserId: string;

    if (guestEmail) {
      const normalizedGuestEmail = (guestEmail || '').trim().toLowerCase();
      if (!meta.guest || !meta.guestEmail || meta.guestEmail !== normalizedGuestEmail) {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 400 });
      }
      payUserId = payment.userId;
    } else {
      if (!userId || payment.userId !== userId) {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 400 });
      }
      payUserId = userId;
    }

    if (payment.status === 'completed') {
      return NextResponse.json({ success: true, alreadyProcessed: true, plan: payment.plan });
    }
    if (payment.status !== 'created') {
      return NextResponse.json({ error: 'Payment record is not in a pending state' }, { status: 400 });
    }

    let order: { status: string; amount: number };
    try {
      order = await razorpay.orders.fetch(orderId) as any;
    } catch (err) {
      console.error('[RazorPay] Order fetch failed:', err);
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    if (order.status !== 'paid' || Number(order.amount) !== payment.amount) {
      console.error('[RazorPay] Order status/amount mismatch', order.status, order.amount, payment.amount);
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (payment.plan === 'credit_refill') {
        const credits = Number((payment.metadata as Record<string, any>)?.credits) || 0;
        if (credits <= 0) throw new Error('Invalid refill credits');
        await tx.creditBalance.upsert({
          where: { userId: payUserId },
          create: { userId: payUserId, balance: credits },
          update: { balance: { increment: credits } },
        });
      } else {
        const def = getPlanDefinition(payment.plan);
        await tx.user.update({
          where: { id: payUserId },
          data: { plan: payment.plan },
        });
        await tx.creditBalance.upsert({
          where: { userId: payUserId },
          create: { userId: payUserId, balance: def.credits },
          update: { balance: def.credits },
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          metadata: {
            ...((payment.metadata as Record<string, any>) || {}),
            paymentId,
            verifiedAt: new Date().toISOString(),
          },
        },
      });
    });

    let resumeId: string | null = null;
    let optimizedResume: string | null = null;

    if (resumeText && typeof resumeText === 'string' && resumeText.trim().length >= 50) {
      try {
        const result = await generateATSPerfectResume(resumeText.trim(), analysis || {});
        optimizedResume = result.optimizedResume;

        const title = fileName
          ? fileName.replace(/\.[^/.]+$/, '')
          : `Quick Fix Resume`;

        const resume = await prisma.resume.create({
          data: {
            userId: payUserId,
            title,
            fileUrl: '',
            rawText: resumeText,
            status: 'fixed',
          },
        });

        if (analysis) {
          await prisma.analysis.create({
            data: {
              resumeId: resume.id,
              userId: payUserId,
              type: 'resume',
              overallScore: analysis.score || 0,
              strengths: analysis.strengths || [],
              redFlags: analysis.redFlags || [],
              suggestions: analysis.suggestions || [],
              keywordGaps: analysis.keywordGaps || [],
              jobRolePotential: analysis.jobRolePotential || null,
              modelUsed: 'google/gemini-2.5-flash-lite',
            },
          });
        }

        resumeId = resume.id;
      } catch (err) {
        console.error('[RazorPay] Resume generation failed after payment:', err);
      }
    }

    return NextResponse.json({
      success: true,
      plan: payment.plan,
      resumeId,
      optimizedResume,
    });
  } catch (error) {
    console.error('[RazorPay] Verification failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment verification failed' },
      { status: 500 }
    );
  }
}
