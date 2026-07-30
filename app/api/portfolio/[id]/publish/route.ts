import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireSessionUserId();

    const existing = await prisma.portfolio.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const newPublished = !existing.isPublished;
    const portfolio = await prisma.portfolio.update({
      where: { id: params.id },
      data: {
        isPublished: newPublished,
        publishedAt: newPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Toggle publish error:', error);
    return NextResponse.json({ error: 'Failed to toggle publish' }, { status: 500 });
  }
}
