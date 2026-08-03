import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fixResumeToPerfectATS } from '@/lib/ai/openrouter';
import { generateOptimizedResumePDF, getPDFBlobURL } from '@/lib/pdf/generateReport';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { CREDIT_COSTS } from '@/lib/constants/credits';

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: 'resumeId is required' },
        { status: 400 }
      );
    }

    const creditBalance = await prisma.creditBalance.findUnique({ where: { userId } });
    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.resume_fix) {
      return NextResponse.json(
        { error: 'Insufficient credits', insufficientCredits: true },
        { status: 402 }
      );
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        analyses: {
          where: { type: 'resume' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!resume.rawText || resume.rawText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short or missing. Please re-upload.' },
        { status: 400 }
      );
    }

    const latestAnalysis = resume.analyses[0];
    const analysisData = latestAnalysis ? {
      score: latestAnalysis.overallScore || 0,
      strengths: latestAnalysis.strengths as string[] || [],
      redFlags: latestAnalysis.redFlags as string[] || [],
      suggestions: latestAnalysis.suggestions as string[] || [],
      keywordGaps: latestAnalysis.keywordGaps as string[] || [],
    } : {
      score: 0,
      strengths: [],
      redFlags: ['No analysis found for this resume'],
      suggestions: ['Run the resume analyzer first to get detailed fixes'],
      keywordGaps: [],
    };

    const { optimizedResume, tokensUsed } = await fixResumeToPerfectATS(
      resume.rawText.trim(),
      analysisData
    );

    const doc = generateOptimizedResumePDF(optimizedResume, {
      generatedAt: new Date().toLocaleString(),
    });
    const pdfBlobUrl = getPDFBlobURL(doc);

    await prisma.creditBalance.update({
      where: { userId },
      data: { balance: { decrement: CREDIT_COSTS.resume_fix } },
    });

    return NextResponse.json({
      success: true,
      optimizedResume,
      pdfUrl: pdfBlobUrl,
      tokensUsed,
      creditsUsed: CREDIT_COSTS.resume_fix,
      creditsRemaining: (creditBalance?.balance || 0) - CREDIT_COSTS.resume_fix,
    });
  } catch (error: any) {
    console.error('Resume fix failed:', error?.message || error);

    if (error?.message?.includes('OpenRouter API error')) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to fix resume. Please try again.' },
      { status: 500 }
    );
  }
}
