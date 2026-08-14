import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateRoadmapFromResume } from '@/lib/ai/openrouter';
import { CREDIT_COSTS } from '@/lib/constants/credits';
import { PLAN_TIER } from '@/lib/constants/plans';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { resolvePlanValidity } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const storedPlan = (user?.plan as string) || 'free';
    const userPlan = await resolvePlanValidity(userId, storedPlan);
    if ((PLAN_TIER[userPlan] ?? 0) < (PLAN_TIER['pro'] ?? 0)) {
      return NextResponse.json({ error: 'Roadmap requires Pro or VIP plan', upgradeRequired: true }, { status: 403 });
    }

    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    if (!resume.rawText || resume.rawText.length < 50) {
      return NextResponse.json({ error: 'Resume has no parseable text. Please re-upload.' }, { status: 400 });
    }

    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { userId_resumeId: { userId, resumeId } },
    });
    if (existingRoadmap) {
      return NextResponse.json({ error: 'A roadmap already exists for this resume' }, { status: 409 });
    }

    const creditBalance = await prisma.creditBalance.findUnique({ where: { userId } });
    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.roadmap_generation) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const analysis = await prisma.analysis.findFirst({
      where: { resumeId, userId, type: 'resume' },
      orderBy: { createdAt: 'desc' },
    });

    const analysisData = analysis ? {
      score: analysis.overallScore || 0,
      strengths: (analysis.strengths as string[]) || [],
      redFlags: (analysis.redFlags as string[]) || [],
      suggestions: (analysis.suggestions as string[]) || [],
      keywordGaps: (analysis.keywordGaps as string[]) || [],
    } : {
      score: 0, strengths: [], redFlags: [], suggestions: [], keywordGaps: [],
    };

    const roadmapResult = await generateRoadmapFromResume(resume.rawText, analysisData);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    const savedRoadmap = await prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: { balance: { decrement: CREDIT_COSTS.roadmap_generation } },
      });

      const roadmap = await tx.roadmap.create({
        data: {
          userId,
          resumeId,
          title: `90-Day Roadmap: ${roadmapResult.recommendedRole.title}`,
          goalRole: roadmapResult.recommendedRole.title,
          currentRole: analysisData.strengths[0] || 'Software Engineer',
          overview: `${roadmapResult.recommendedRole.reasoning}\n\nExpected timeline: ${roadmapResult.recommendedRole.timeToReady}\nSalary range: ${roadmapResult.recommendedRole.salaryRange}`,
          currentStrengths: roadmapResult.currentStrengths,
          criticalGaps: roadmapResult.criticalGaps as any,
          phases: roadmapResult.phases as any,
           totalTasks: roadmapResult.totalTasks,
          endDate,
           phase1Unlocked: true,
          phase2Unlocked: true,
          phase3Unlocked: true,
          aiGenerated: true,
        },
      });

      await tx.usageRecord.create({
        data: { userId, type: 'roadmap', count: 1, modelUsed: 'google/gemini-2.5-pro' },
      });

      return roadmap;
    });

    return NextResponse.json({
      id: savedRoadmap.id,
      title: savedRoadmap.title,
      goalRole: savedRoadmap.goalRole,
      recommendedRole: roadmapResult.recommendedRole,
      totalTasks: roadmapResult.totalTasks,
      creditsUsed: CREDIT_COSTS.roadmap_generation,
      creditsRemaining: (creditBalance?.balance || 0) - CREDIT_COSTS.roadmap_generation,
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Roadmap generation failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      select: {
        id: true, resumeId: true, title: true, goalRole: true,
        currentPhase: true, totalTasks: true, completedTasks: true,
        progress: true, isActive: true, startDate: true, endDate: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ roadmaps });
  } catch (error) {
    console.error('Fetch roadmaps error:', error);
    return NextResponse.json({ error: 'Failed to fetch roadmaps' }, { status: 500 });
  }
}
