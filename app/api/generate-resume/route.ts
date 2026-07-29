import { NextResponse } from 'next/server';
import { generateATSPerfectResume, generateTailoredResumeForJob } from '@/lib/ai/openrouter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeText, analysis, jobDescription, jobTitle, company } = body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short or missing. Please re-upload your resume.' },
        { status: 400 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis data is missing. Please re-run the analysis.' },
        { status: 400 }
      );
    }

    const { optimizedResume, tokensUsed } = jobDescription
      ? await generateTailoredResumeForJob(resumeText.trim(), analysis, jobDescription, jobTitle || '', company || '')
      : await generateATSPerfectResume(resumeText.trim(), analysis);

    return NextResponse.json({
      success: true,
      optimizedResume,
      tokensUsed
    });
  } catch (error: any) {
    console.error('Resume generation failed:', error?.message || error);

    if (error?.message?.includes('OpenRouter API error')) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to generate optimized resume. Please try again.' },
      { status: 500 }
    );
  }
}
