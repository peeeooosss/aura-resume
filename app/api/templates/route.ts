import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateCoverLetter } from '@/lib/ai/openrouter';
import { CREDIT_COSTS } from '@/lib/constants/credits';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobDescription, jobUrl, userId, resumeId } = body;

    if (!jobDescription || !userId) {
      return NextResponse.json(
        { error: 'jobDescription and userId are required' },
        { status: 400 }
      );
    }

    const creditBalance = await prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.cover_letter) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: CREDIT_COSTS.cover_letter, available: creditBalance?.balance || 0 },
        { status: 402 }
      );
    }

    let resumeText = '';
    if (resumeId) {
      const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
      if (resume) resumeText = resume.rawText || '';
    }

    if (!resumeText) {
      const latestResume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (latestResume) resumeText = latestResume.rawText || '';
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: 'No resume found. Please upload a resume first.' },
        { status: 400 }
      );
    }

    const result = await generateCoverLetter(jobDescription, resumeText);

    await prisma.$transaction(async (tx) => {
      await tx.linkedInTemplate.create({
        data: {
          userId,
          jdText: jobDescription,
          jdUrl: jobUrl,
          templates: {
            coverLetter: result.coverLetter,
            matchHighlights: result.matchHighlights,
            subjectLines: result.suggestedSubjectLines,
          },
          matchHighlights: result.matchHighlights,
        },
      });

      await tx.creditBalance.update({
        where: { userId },
        data: { balance: { decrement: CREDIT_COSTS.cover_letter } },
      });

      await tx.usageRecord.create({
        data: {
          userId,
          type: 'linkedin_template',
          count: 1,
          modelUsed: 'anthropic/claude-3.5-sonnet',
        },
      });
    });

    return NextResponse.json({
      ...result,
      creditsUsed: CREDIT_COSTS.cover_letter,
      creditsRemaining: creditBalance.balance - CREDIT_COSTS.cover_letter,
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cover letter generation failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const templates = await prisma.linkedInTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ templates });
}