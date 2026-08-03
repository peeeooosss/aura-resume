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
    console.error('[PDF Parse] Primary parser failed:', error);

    const errMsg = error instanceof Error ? error.message : String(error);

    // Fatal/structured errors that should not be retried with the fallback
    if (errMsg.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file format');
    }
    if (errMsg.includes('password') || errMsg.includes('encrypted')) {
      throw new Error('PDF is password-protected. Please remove password and re-upload.');
    }
    if (errMsg.includes('empty text')) {
      throw new Error('PDF appears to be scanned/image-based. Please upload a text-based PDF or use OCR first.');
    }

    // Fallback: some PDF generators produce malformed content streams
    // (e.g. unbalanced parentheses) that pdf.js rejects. Try a raw text
    // extraction before giving up.
    const fallbackText = extractPdfTextFallback(buffer);
    if (fallbackText && fallbackText.trim().length >= 50) {
      console.log(`[PDF Parse] Fallback extracted ${fallbackText.length} chars`);
      return fallbackText;
    }

    throw new Error(`Failed to parse PDF: ${errMsg}`);
  }
}

/**
 * Lightweight fallback extractor for text-based PDFs.
 * Decodes the raw bytes and pulls text out of common PDF text operators
 * such as (text) Tj and [(text)] TJ. This is intentionally tolerant of
 * malformed PDFs that strict parsers reject.
 */
function extractPdfTextFallback(buffer: Buffer): string {
  try {
    // Use latin1 so every byte maps to a character without replacement.
    const raw = buffer.toString('latin1');
    const pieces: string[] = [];
    const seenRanges = new Set<string>();

    const addPiece = (value: string, start: number, end: number) => {
      const key = `${start}-${end}`;
      if (seenRanges.has(key)) return;
      seenRanges.add(key);
      const decoded = decodePdfLiteralString(value);
      if (decoded) pieces.push(decoded);
    };

    // Scan for literal strings used by Tj/TJ operators. We use a tiny
    // state machine so escaped parentheses inside the string do not trip
    // us up.
    let i = 0;
    while (i < raw.length) {
      if (raw[i] !== '(') {
        i++;
        continue;
      }

      const extracted = readPdfLiteralString(raw, i);
      if (extracted === null) {
        i++;
        continue;
      }

      const after = raw.slice(extracted.end, extracted.end + 10).trim();
      if (after.startsWith('Tj') || after.startsWith('TJ')) {
        addPiece(extracted.value, i, extracted.end);
      }
      i = extracted.end;
    }

    // Second pass: collect strings inside bracketed TJ arrays like
    // [(text1) (text2) ...] TJ
    let j = 0;
    while (j < raw.length) {
      if (raw[j] !== '[') {
        j++;
        continue;
      }

      const arrayStart = j;
      let arrayEnd = raw.indexOf('] TJ', arrayStart);
      if (arrayEnd === -1) arrayEnd = raw.indexOf(']TJ', arrayStart);
      if (arrayEnd === -1) {
        j++;
        continue;
      }

      const inner = raw.slice(arrayStart + 1, arrayEnd);
      let k = 0;
      while (k < inner.length) {
        if (inner[k] !== '(') {
          k++;
          continue;
        }
        const extracted = readPdfLiteralString(inner, k);
        if (extracted === null) {
          k++;
          continue;
        }
        addPiece(extracted.value, arrayStart + 1 + k, arrayStart + 1 + extracted.end);
        k = extracted.end;
      }

      j = arrayEnd + 3;
    }

    return pieces.join(' ');
  } catch (e) {
    console.error('[PDF Parse] Fallback extraction failed:', e);
    return '';
  }
}

function readPdfLiteralString(raw: string, start: number): { value: string; end: number } | null {
  let depth = 0;
  let escaped = false;
  let value = '';

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];

    if (escaped) {
      value += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      value += ch;
      escaped = true;
      continue;
    }

    if (ch === '(') {
      value += ch;
      depth++;
      continue;
    }

    if (ch === ')') {
      depth--;
      if (depth === 0) {
        // closing the outer string; the value already includes the opening
        // parenthesis, so strip it before returning.
        return { value: value.slice(1), end: i + 1 };
      }
      value += ch;
      continue;
    }

    value += ch;
  }

  return null;
}

function decodePdfLiteralString(value: string): string {
  let out = '';
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== '\\') {
      out += value[i];
      continue;
    }

    const next = value[i + 1];
    if (next === undefined) {
      out += '\\';
      break;
    }

    switch (next) {
      case 'n': out += '\n'; i++; break;
      case 'r': out += '\r'; i++; break;
      case 't': out += '\t'; i++; break;
      case 'b': out += '\b'; i++; break;
      case 'f': out += '\f'; i++; break;
      case '(': out += '('; i++; break;
      case ')': out += ')'; i++; break;
      case '\\': out += '\\'; i++; break;
      default: {
        // Octal escape: up to three digits
        const octal = value.slice(i + 1, i + 4).match(/^[0-7]{1,3}/)?.[0];
        if (octal) {
          out += String.fromCharCode(parseInt(octal, 8));
          i += octal.length;
        } else {
          out += value[i];
        }
      }
    }
  }
  return out.trim();
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
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim();

  const urlPattern = /https?:\/\/[^\s)>\]]+/g;
  const urls = cleaned.match(urlPattern);

  if (urls && urls.length > 0) {
    const uniqueUrls: string[] = [];
    for (const url of urls) {
      if (uniqueUrls.indexOf(url) === -1) uniqueUrls.push(url);
    }
    const linksSection = '\n\n## Detected Links\n' + uniqueUrls.map((url, i) => `- ${url}`).join('\n');
    return cleaned + linksSection;
  }

  return cleaned;
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