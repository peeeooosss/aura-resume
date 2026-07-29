import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const where: any = { userId };
    if (status) {
      const statuses = status.split(',');
      where.status = { in: statuses };
    }

    const resumes = await prisma.resume.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        parent: { select: { id: true, title: true, version: true } },
      },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Failed to fetch resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}
