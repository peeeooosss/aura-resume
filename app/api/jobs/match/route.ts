import { NextResponse } from 'next/server';
import { analyzeJobMatch } from '@/lib/ai/openrouter';
import { prisma } from '@/lib/db';
import { CREDIT_COSTS } from '@/lib/constants/credits';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await request.json();
    const { jobDescription, resumeText } = body;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job description is too short. Please provide a complete job description.' },
        { status: 400 }
      );
    }

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short. Please upload and analyze a resume first.' },
        { status: 400 }
      );
    }

    const creditBalance = await prisma.creditBalance.findUnique({ where: { userId } });
    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.job_match) {
      return NextResponse.json(
        { error: 'Insufficient credits', insufficientCredits: true, required: CREDIT_COSTS.job_match, available: creditBalance?.balance || 0 },
        { status: 402 }
      );
    }

    const result = await analyzeJobMatch(jobDescription.trim(), resumeText.trim());

    await prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: { balance: { decrement: CREDIT_COSTS.job_match } },
      });
      await tx.usageRecord.create({
        data: { userId, type: 'job_match', count: 1, modelUsed: 'google/gemini-2.5-flash-lite' },
      });
    });

    return NextResponse.json({
      ...result,
      creditsUsed: CREDIT_COSTS.job_match,
      creditsRemaining: (creditBalance?.balance || 0) - CREDIT_COSTS.job_match,
    });
  } catch (error: any) {
    console.error('Job match analysis failed:', error?.message || error);

    if (error?.message?.includes('OpenRouter API error')) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to analyze job match. Please try again.' },
      { status: 500 }
    );
  }
}
