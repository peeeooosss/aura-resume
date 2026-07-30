import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function GET() {
  try {
    const userId = await requireSessionUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });

    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        rawText: true,
        status: true,
        createdAt: true,
      },
    });

    const analyses = await prisma.analysis.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        overallScore: true,
        strengths: true,
        redFlags: true,
        suggestions: true,
        keywordGaps: true,
        createdAt: true,
      },
    });

    const jobMatches = await prisma.jobMatch.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        matchScore: true,
        status: true,
        createdAt: true,
      },
    });

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        goalRole: true,
        progress: true,
        createdAt: true,
      },
    });

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        views: true,
        createdAt: true,
      },
    });

    const interviewSessions = await prisma.interviewSession.findMany({
      where: { userId },
      select: {
        id: true,
        targetRole: true,
        interviewType: true,
        difficulty: true,
        overallScore: true,
        status: true,
        startedAt: true,
      },
    });

    const creditBalance = await prisma.creditBalance.findUnique({
      where: { userId },
      select: { balance: true },
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      resumes,
      analyses,
      jobMatches,
      roadmaps,
      portfolios,
      interviewSessions,
      creditBalance,
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
