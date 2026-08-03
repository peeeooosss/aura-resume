import { NextResponse } from 'next/server';
import { generateATSPerfectResume, generateTailoredResumeForJob } from '@/lib/ai/openrouter';
import { prisma } from '@/lib/db';
import { CREDIT_COSTS } from '@/lib/constants/credits';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await request.json();
    const { resumeText, analysis, jobDescription, jobTitle, company } = body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short or missing. Please re-upload your resume.' },
        { status: 400 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis data is missing. Please re-run the analysis.' },
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

    const { optimizedResume, tokensUsed } = jobDescription
      ? await generateTailoredResumeForJob(resumeText.trim(), analysis, jobDescription, jobTitle || '', company || '')
      : await generateATSPerfectResume(resumeText.trim(), analysis);

    await prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: { balance: { decrement: CREDIT_COSTS.job_match } },
      });
      await tx.usageRecord.create({
        data: { userId, type: 'resume_rewrite', count: 1, modelUsed: 'google/gemini-2.5-flash-lite' },
      });
    });

    return NextResponse.json({
      success: true,
      optimizedResume,
      tokensUsed,
      creditsUsed: CREDIT_COSTS.job_match,
      creditsRemaining: (creditBalance?.balance || 0) - CREDIT_COSTS.job_match,
    });
  } catch (error: any) {
    console.error('Resume generation failed:', error?.message || error);

    if (error?.message?.includes('OpenRouter API error')) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to generate optimized resume. Please try again.' },
      { status: 500 }
    );
  }
}
