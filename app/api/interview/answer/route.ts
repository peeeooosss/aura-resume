import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateInterviewAnswer } from '@/lib/ai/openrouter';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { sessionId, answer } = body;

    if (!sessionId || !answer) {
      return NextResponse.json({ error: 'sessionId and answer are required' }, { status: 400 });
    }

    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId, status: 'active' },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found or already completed' }, { status: 404 });
    }

    const questions = session.questions as any[];
    const currentIdx = session.currentQ;

    if (currentIdx >= questions.length) {
      return NextResponse.json({ error: 'All questions already answered' }, { status: 400 });
    }

    const currentQuestion = questions[currentIdx];

    const evaluation = await evaluateInterviewAnswer(
      currentQuestion.question,
      currentQuestion.expectedPoints,
      answer,
      session.targetRole
    );

    const updatedQuestions = [...questions];
    updatedQuestions[currentIdx] = {
      ...currentQuestion,
      answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
    };

    const isLastQuestion = currentIdx + 1 >= questions.length;

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        questions: updatedQuestions as any,
        currentQ: currentIdx + 1,
        status: isLastQuestion ? 'completed' : 'active',
        completedAt: isLastQuestion ? new Date() : undefined,
        duration: isLastQuestion
          ? Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)
          : undefined,
      },
    });

    return NextResponse.json({
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        followUp: evaluation.followUp,
        expectedPointsHit: evaluation.expectedPointsHit,
        expectedPointsMissed: evaluation.expectedPointsMissed,
      },
      nextQuestion: !isLastQuestion ? updatedQuestions[currentIdx + 1] : null,
      isComplete: isLastQuestion,
      progress: {
        current: currentIdx + 1,
        total: questions.length,
      },
    });
  } catch (error) {
    console.error('Interview answer error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
