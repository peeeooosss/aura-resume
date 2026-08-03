import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { prisma } from '@/lib/db';
import { getInitialCredits } from '@/lib/constants/credits';
import { generateATSPerfectResume } from '@/lib/ai/openrouter';
import crypto from 'crypto';

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      plan,
      resumeText,
      analysis,
      fileName,
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

    const resolvedPlan = plan || 'quick';

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { plan: resolvedPlan },
      });

      await tx.creditBalance.upsert({
        where: { userId },
        create: { userId, balance: getInitialCredits(resolvedPlan) },
        update: { balance: getInitialCredits(resolvedPlan) },
      });

      await tx.payment.create({
        data: {
          userId,
          razorpayId: paymentId,
          amount: body.amount || (resolvedPlan === 'quick' ? 4900 : resolvedPlan === 'pro' ? 49900 : 149900),
          currency: 'INR',
          plan: resolvedPlan,
          status: 'completed',
          metadata: { orderId, plan: resolvedPlan },
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
            userId,
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
              userId,
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
      plan: resolvedPlan,
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
