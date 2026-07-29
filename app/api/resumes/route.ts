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
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            overallScore: true,
            strengths: true,
            redFlags: true,
            suggestions: true,
            keywordGaps: true,
          },
        },
      },
    });

    const result = resumes.map(r => ({
      ...r,
      atsScore: r.analyses?.[0]?.overallScore ?? null,
      strengths: r.analyses?.[0]?.strengths ?? [],
      redFlags: r.analyses?.[0]?.redFlags ?? [],
      suggestions: r.analyses?.[0]?.suggestions ?? [],
      keywordGaps: r.analyses?.[0]?.keywordGaps ?? [],
      analyses: undefined,
    }));

    return NextResponse.json({ resumes: result });
  } catch (error) {
    console.error('Failed to fetch resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, rawText, status, atsScore, strengths, redFlags, suggestions, keywordGaps, parentId } = body;

    if (!userId || !title) {
      return NextResponse.json({ error: 'userId and title required' }, { status: 400 });
    }

    const resume = await prisma.$transaction(async tx => {
      const r = await tx.resume.create({
        data: {
          userId,
          title,
          fileUrl: '',
          rawText: rawText || '',
          status: status || 'analyzed',
          parentId: parentId || null,
        },
      });

      if (atsScore !== null && atsScore !== undefined) {
        await tx.analysis.create({
          data: {
            resumeId: r.id,
            userId,
            type: 'resume',
            overallScore: atsScore,
            strengths: strengths || [],
            redFlags: redFlags || [],
            suggestions: suggestions || [],
            keywordGaps: keywordGaps || [],
            modelUsed: 'google/gemini-2.5-flash-lite',
          },
        });
      }

      return r;
    });

    return NextResponse.json({ resumeId: resume.id, title: resume.title, status: resume.status });
  } catch (error) {
    console.error('Failed to save resume:', error);
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
  }
}
