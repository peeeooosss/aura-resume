import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug: params.slug, isPublished: true },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Public portfolio error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
