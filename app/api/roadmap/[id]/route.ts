import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireSessionUserId();
    const { id } = params;

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId },
    });

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error('Fetch roadmap error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireSessionUserId();
    const { id } = params;
    const body = await req.json();
    const { action, phaseNumber } = body;

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId },
    });

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    if (action === 'unlock_phase' && phaseNumber) {
      const phaseKey = `phase${phaseNumber}Unlocked` as string;
      const updatedRoadmap = await prisma.roadmap.update({
        where: { id },
        data: {
          [phaseKey]: true,
          currentPhase: Math.max(roadmap.currentPhase, phaseNumber),
        },
      });
      return NextResponse.json({ roadmap: updatedRoadmap });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update roadmap error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update roadmap' },
      { status: 500 }
    );
  }
}
