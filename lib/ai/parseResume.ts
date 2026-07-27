import { extractRawText } from 'mammoth';

export async function parseResumeFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf' || mimeType === 'application/x-pdf') {
    return parsePDF(buffer);
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return parseDOCX(buffer);
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. Ensure file is not password-protected or corrupted.');
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX. Ensure file is not corrupted.');
  }
}

export function cleanResumeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim();
}

export function validateResumeText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length < 50) {
    return { valid: false, error: 'Resume text too short. Could not extract meaningful content.' };
  }

  if (text.trim().length > 100000) {
    return { valid: false, error: 'Resume text too long. Please provide a concise resume (max 100k characters).' };
  }

  return { valid: true };
}

export function extractSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = text.split('\n');
  let currentSection = 'header';
  let currentContent: string[] = [];

  const sectionKeywords = [
    'experience', 'work experience', 'employment', 'professional experience',
    'education', 'academic', 'qualifications',
    'skills', 'technical skills', 'core competencies', 'expertise',
    'projects', 'personal projects', 'notable projects',
    'certifications', 'licenses', 'credentials',
    'summary', 'profile', 'objective', 'about',
    'awards', 'achievements', 'honors',
    'publications', 'papers',
    'volunteer', 'volunteering',
    'languages',
    'interests', 'hobbies',
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    const isSectionHeader = sectionKeywords.some(
      (kw) => lowerLine === kw || lowerLine.startsWith(kw + ':') || lowerLine.endsWith(':' + kw)
    );

    if (isSectionHeader && currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
      currentSection = lowerLine.replace(':', '').trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}