import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateInterviewQuestions } from '@/lib/ai/openrouter';
import { CREDIT_COSTS } from '@/lib/constants/credits';
import { PLAN_TIER } from '@/lib/constants/plans';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { resolvePlanValidity } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { resumeId, targetRole, interviewType = 'mixed', difficulty = 'medium' } = body;

    if (!resumeId || !targetRole) {
      return NextResponse.json({ error: 'resumeId and targetRole are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const storedPlan = (user?.plan as string) || 'free';
    const userPlan = await resolvePlanValidity(userId, storedPlan);
    if ((PLAN_TIER[userPlan] ?? 0) < (PLAN_TIER['vip'] ?? 0)) {
      return NextResponse.json({ error: 'AI Interviews require VIP plan', upgradeRequired: true }, { status: 403 });
    }

    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    if (!resume.rawText || resume.rawText.length < 50) {
      return NextResponse.json({ error: 'Resume has no parseable text. Please re-upload.' }, { status: 400 });
    }

    const creditBalance = await prisma.creditBalance.findUnique({ where: { userId } });
    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.ai_interview) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { questions, tokensUsed } = await generateInterviewQuestions(
      resume.rawText,
      targetRole,
      interviewType,
      difficulty,
      10
    );

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    const savedSession = await prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: { balance: { decrement: CREDIT_COSTS.ai_interview } },
      });

      const session = await tx.interviewSession.create({
        data: {
          userId,
          resumeId,
          targetRole,
          interviewType,
          difficulty,
          questions: questions as any,
          currentQ: 0,
          totalQuestions: questions.length,
        },
      });

      await tx.usageRecord.create({
        data: { userId, type: 'ai_interview', count: 1, modelUsed: 'google/gemini-2.5-flash-lite' },
      });

      return session;
    });

    return NextResponse.json({
      id: savedSession.id,
      targetRole: savedSession.targetRole,
      interviewType: savedSession.interviewType,
      difficulty: savedSession.difficulty,
      totalQuestions: savedSession.totalQuestions,
      firstQuestion: questions[0],
      creditsUsed: CREDIT_COSTS.ai_interview,
      creditsRemaining: (creditBalance?.balance || 0) - CREDIT_COSTS.ai_interview,
    });
  } catch (error) {
    console.error('Interview start error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start interview' },
      { status: 500 }
    );
  }
}
