import { NextResponse } from 'next/server';
import { analyzeJobMatch } from '@/lib/ai/openrouter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobDescription, resumeText } = body;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job description is too short. Please provide a complete job description.' },
        { status: 400 }
      );
    }

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short. Please upload and analyze a resume first.' },
        { status: 400 }
      );
    }

    const result = await analyzeJobMatch(jobDescription.trim(), resumeText.trim());

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Job match analysis failed:', error?.message || error);

    if (error?.message?.includes('OpenRouter API error')) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to analyze job match. Please try again.' },
      { status: 500 }
    );
  }
}
