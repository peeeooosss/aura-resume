import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function GET() {
  try {
    const userId = await requireSessionUserId();

    const analyses = await prisma.analysis.findMany({
      where: { userId, type: 'linkedin' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = analyses.map((a) => ({
      id: a.id,
      score: a.overallScore,
      strengths: a.strengths,
      redFlags: a.redFlags,
      suggestions: a.suggestions,
      modelUsed: a.modelUsed,
      tokensUsed: a.tokensUsed,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch LinkedIn history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis history' },
      { status: 500 }
    );
  }
}
