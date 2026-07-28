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
    // Debug: Check buffer
    console.log(`[PDF Parse] Buffer length: ${buffer.length}`);
    console.log(`[PDF Parse] First 32 bytes: ${buffer.toString('hex', 0, 32)}`);
    
    // Check for PDF signature
    const pdfSignature = buffer.toString('ascii', 0, 4);
    if (pdfSignature !== '%PDF') {
      console.warn(`[PDF Parse] Invalid PDF signature: ${pdfSignature}`);
    }

    const pdfParse = (await import('pdf-parse-fork')).default;
    const result = await pdfParse(buffer);
    
    console.log(`[PDF Parse] Extracted text length: ${result.text.length}`);
    console.log(`[PDF Parse] Sample text: ${result.text.slice(0, 100)}`);
    
    if (!result.text || result.text.trim().length === 0) {
      throw new Error('PDF extracted empty text - may be scanned/image-based PDF');
    }
    
    return result.text;
  } catch (error: unknown) {
    console.error('[PDF Parse] Error:', error);
    
    // Check for specific error types
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file format');
    }
    if (errMsg.includes('password') || errMsg.includes('encrypted')) {
      throw new Error('PDF is password-protected. Please remove password and re-upload.');
    }
    if (errMsg.includes('empty text')) {
      throw new Error('PDF appears to be scanned/image-based. Please upload a text-based PDF or use OCR first.');
    }
    throw new Error(`Failed to parse PDF: ${errMsg}`);
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    console.log(`[DOCX Parse] Buffer length: ${buffer.length}`);
    console.log(`[DOCX Parse] First 32 bytes: ${buffer.toString('hex', 0, 32)}`);
    
    const result = await extractRawText({ buffer });
    
    console.log(`[DOCX Parse] Extracted text length: ${result.value.length}`);
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX extracted empty text');
    }
    
    return result.value;
  } catch (error: unknown) {
    console.error('[DOCX Parse] Error:', error);
    
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('encrypted') || errMsg.includes('password')) {
      throw new Error('DOCX is password-protected. Please remove password and re-upload.');
    }
    throw new Error(`Failed to parse DOCX: ${errMsg}`);
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