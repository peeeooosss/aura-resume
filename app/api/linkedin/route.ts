import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scrapeLinkedInProfile } from '@/lib/apify/linkedin';
import { analyzeLinkedIn } from '@/lib/ai/openrouter';
import { CREDIT_COSTS } from '@/lib/constants/credits';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkedinUrl, userId = 'demo-user' } = body;

    if (!linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn URL required' }, { status: 400 });
    }

    const creditBalance = await prisma.creditBalance.findUnique({ where: { userId } });
    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.linkedin_analysis) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const profileData = await scrapeLinkedInProfile(linkedinUrl);

    const analysis = await analyzeLinkedIn(profileData);

    await prisma.creditBalance.update({
      where: { userId },
      data: { balance: { decrement: CREDIT_COSTS.linkedin_analysis } },
    });

    await prisma.linkedInProfile.upsert({
      where: { userId },
      create: {
        userId,
        linkedinUrl,
        headline: profileData.headline,
        summary: profileData.summary,
        experience: profileData.experience,
        skills: profileData.skills,
        analysisScore: analysis.score,
        suggestions: analysis.suggestions,
        lastSyncedAt: new Date(),
      },
      update: {
        linkedinUrl,
        headline: profileData.headline,
        summary: profileData.summary,
        experience: profileData.experience,
        skills: profileData.skills,
        analysisScore: analysis.score,
        suggestions: analysis.suggestions,
        lastSyncedAt: new Date(),
      },
    });

    await prisma.analysis.create({
      data: {
        userId,
        resumeId: 'linkedin-only',
        type: 'linkedin',
        overallScore: analysis.score,
        strengths: analysis.strengths,
        redFlags: analysis.redFlags,
        suggestions: analysis.suggestions,
        modelUsed: 'claude-3.5-sonnet',
        tokensUsed: analysis.tokensUsed,
      },
    });

    await prisma.usageRecord.create({
      data: {
        userId,
        type: 'linkedin_analysis',
        count: 1,
        modelUsed: 'claude-3.5-sonnet',
      },
    });

    return NextResponse.json({
      score: analysis.score,
      strengths: analysis.strengths,
      redFlags: analysis.redFlags,
      suggestions: analysis.suggestions,
      tokensUsed: analysis.tokensUsed,
      creditsUsed: CREDIT_COSTS.linkedin_analysis,
      creditsRemaining: creditBalance.balance - CREDIT_COSTS.linkedin_analysis,
    });
  } catch (error) {
    console.error('LinkedIn analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'LinkedIn analysis failed' },
      { status: 500 }
    );
  }
}