import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId, getSessionUserId } from '@/lib/auth/getSessionUser';
import { resolvePlanValidity } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

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
            jobRolePotential: true,
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
      jobRolePotential: r.analyses?.[0]?.jobRolePotential ?? null,
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
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { title, rawText, optimizedText, status, atsScore, strengths, redFlags, suggestions, keywordGaps, jobRolePotential, parentId } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const storedPlan = user?.plan || 'free';
    const userPlan = await resolvePlanValidity(userId, storedPlan);
    const PLAN_TIER: Record<string, number> = { free: 0, quick: 1, pro: 2, vip: 3 };
    const canSave = (PLAN_TIER[userPlan] ?? 0) >= (PLAN_TIER['quick'] ?? 0);

    if (!canSave) {
      return NextResponse.json(
        { error: 'Resume saving requires a paid plan (Pro or VIP)', upgradeRequired: true },
        { status: 403 }
      );
    }

    const resume = await prisma.$transaction(async tx => {
      const r = await tx.resume.create({
        data: {
          userId,
          title,
          fileUrl: '',
          rawText: rawText || '',
          optimizedText: optimizedText || undefined,
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
            jobRolePotential: jobRolePotential || null,
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
