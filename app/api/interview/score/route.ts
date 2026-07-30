import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateInterviewReport } from '@/lib/ai/openrouter';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'completed') {
      return NextResponse.json({ error: 'Interview not yet completed' }, { status: 400 });
    }

    if (session.overallScore !== null) {
      const existingReport = {
        overallScore: session.overallScore,
        scores: session.scores,
        summary: session.summary,
        feedback: session.feedback,
      };
      return NextResponse.json(existingReport);
    }

    const questions = session.questions as any[];
    const answeredQuestions = questions.filter((q: any) => q.answer && q.score !== undefined);

    if (answeredQuestions.length === 0) {
      return NextResponse.json({ error: 'No answered questions to score' }, { status: 400 });
    }

    const report = await generateInterviewReport(
      answeredQuestions.map((q: any) => ({
        question: q.question,
        answer: q.answer,
        score: q.score,
        feedback: q.feedback || '',
      })),
      session.targetRole
    );

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        overallScore: report.overallScore,
        scores: report.scores as any,
        summary: report.summary,
        feedback: report.questionFeedback as any,
      },
    });

    return NextResponse.json({
      overallScore: report.overallScore,
      scores: report.scores,
      summary: report.summary,
      strengths: report.strengths,
      improvements: report.improvements,
      questionFeedback: report.questionFeedback,
    });
  } catch (error) {
    console.error('Interview score error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
}
