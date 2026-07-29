import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateRoadmap } from '@/lib/ai/openrouter';
import { CREDIT_COSTS } from '@/lib/constants/credits';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { currentRole, goalRole, skills } = body;

    if (!currentRole || !goalRole) {
      return NextResponse.json({ error: 'Current role and goal role required' }, { status: 400 });
    }

    const creditBalance = await prisma.creditBalance.findUnique({ where: { userId } });
    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.roadmap_generation) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const roadmap = await generateRoadmap(currentRole, goalRole, skills || []);

    await prisma.creditBalance.update({
      where: { userId },
      data: { balance: { decrement: CREDIT_COSTS.roadmap_generation } },
    });

    const savedRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        title: roadmap.title,
        goalRole: roadmap.goalRole,
        currentRole: roadmap.currentRole,
        timeline: roadmap.timeline,
        skillsToLearn: roadmap.skillsToLearn,
        milestones: roadmap.resources,
        aiGenerated: true,
      },
    });

    await prisma.usageRecord.create({
      data: {
        userId,
        type: 'roadmap',
        count: 1,
        modelUsed: 'claude-3.5-sonnet',
      },
    });

    return NextResponse.json({
      ...roadmap,
      id: savedRoadmap.id,
      creditsUsed: CREDIT_COSTS.roadmap_generation,
      creditsRemaining: creditBalance.balance - CREDIT_COSTS.roadmap_generation,
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Roadmap generation failed' },
      { status: 500 }
    );
  }
}