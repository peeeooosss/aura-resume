import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const resultId = searchParams.get('resultId');

  if (!resultId) {
    return NextResponse.json({ error: 'resultId is required' }, { status: 400 });
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        status: 'completed',
        metadata: {
          path: ['resultId'],
          equals: resultId,
        },
      },
      select: {
        metadata: true,
        createdAt: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'No completed payment for this result' }, { status: 404 });
    }

    const meta = (payment.metadata as Record<string, any>) || {};

    return NextResponse.json({
      found: true,
      optimizedResume: meta.optimizedResume ?? null,
      resumeId: meta.resumeId ?? null,
      analysisScore: meta.analysisScore ?? null,
    });
  } catch (err) {
    console.error('[recover] Failed:', err);
    return NextResponse.json({ error: 'Recovery failed' }, { status: 500 });
  }
}
