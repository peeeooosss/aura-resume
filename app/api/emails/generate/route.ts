import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';
import { CREDIT_COSTS } from '@/lib/constants/credits';
import { buildColdEmailPrompt } from '@/lib/ai/prompts';
import { generateText } from '@/lib/ai/openrouter';

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await request.json();
    const { resumeId, targetCompany, targetRole, emailType } = body;

    if (!resumeId || !targetCompany || !targetRole) {
      return NextResponse.json(
        { error: 'resumeId, targetCompany, and targetRole are required' },
        { status: 400 }
      );
    }

    const creditBalance = await prisma.creditBalance.findUnique({ where: { userId } });
    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.cold_email) {
      return NextResponse.json(
        { error: 'Insufficient credits', insufficientCredits: true },
        { status: 402 }
      );
    }

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!resume.rawText || resume.rawText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short or missing. Please re-upload.' },
        { status: 400 }
      );
    }

    const prompt = buildColdEmailPrompt(
      resume.rawText,
      targetCompany,
      targetRole,
      emailType || 'networking'
    );

    const result = await generateText(prompt);

    const emailData = JSON.parse(result.text);

    const newBalance = await prisma.creditBalance.update({
      where: { userId },
      data: { balance: { decrement: CREDIT_COSTS.cold_email } },
    });

    return NextResponse.json({
      success: true,
      ...emailData,
      creditsUsed: CREDIT_COSTS.cold_email,
      creditsRemaining: newBalance.balance,
    });
  } catch (error: any) {
    console.error('Cold email generation failed:', error?.message || error);

    if (error?.message?.includes('OpenRouter API error')) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to generate email. Please try again.' },
      { status: 500 }
    );
  }
}
