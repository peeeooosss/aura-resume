import { NextResponse } from 'next/server';
import { parseResumeFile } from '@/lib/ai/parseResume';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const text = await parseResumeFile(buffer, file.type);
    return NextResponse.json({
      success: true,
      textLength: text.length,
      sampleText: text.slice(0, 200) + '...'
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: err.message,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size,
        firstBytes: buffer.toString('hex', 0, 32)
      },
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}