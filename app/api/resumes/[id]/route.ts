import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth/getSessionUser';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId },
      include: {
        parent: { select: { id: true, title: true, version: true, rawText: true } },
        children: {
          select: { id: true, title: true, version: true, status: true, createdAt: true },
          orderBy: { version: 'desc' },
        },
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            overallScore: true,
            strengths: true,
            redFlags: true,
            suggestions: true,
            keywordGaps: true,
            jobRolePotential: true,
            modelUsed: true,
            tokensUsed: true,
            createdAt: true,
          },
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const latestAnalysis = resume.analyses?.[0] || null;

    const result = {
      id: resume.id,
      title: resume.title,
      fileUrl: resume.fileUrl,
      rawText: resume.rawText,
      optimizedText: resume.optimizedText,
      status: resume.status,
      version: resume.version,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
      parent: resume.parent,
      children: resume.children,
      analysis: latestAnalysis ? {
        id: latestAnalysis.id,
        score: latestAnalysis.overallScore,
        strengths: latestAnalysis.strengths,
        redFlags: latestAnalysis.redFlags,
        suggestions: latestAnalysis.suggestions,
        keywordGaps: latestAnalysis.keywordGaps,
        jobRolePotential: latestAnalysis.jobRolePotential,
        modelUsed: latestAnalysis.modelUsed,
        tokensUsed: latestAnalysis.tokensUsed,
        createdAt: latestAnalysis.createdAt.toISOString(),
      } : null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch resume:', error);
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    await prisma.resume.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete resume:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
