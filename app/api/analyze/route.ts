import { NextRequest } from 'next/server';
import { generateMockAnalysis } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const resumeFile = formData.get('resume') as File | null;
  const linkedinUrl = formData.get('linkedin') as string | null;

  if (!resumeFile && !linkedinUrl) {
    return Response.json({ error: 'Provide resume or LinkedIn URL' }, { status: 400 });
  }

  const result = generateMockAnalysis(
    resumeFile?.name || undefined,
    linkedinUrl || undefined
  );

  return Response.json(result);
}
