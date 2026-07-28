import { jsPDF } from 'jspdf';

export interface AnalysisReportData {
  resume?: {
    score: number;
    strengths: string[];
    redFlags: string[];
    suggestions?: string[];
    keywordGaps?: string[];
  };
  linkedin?: {
    score: number;
    strengths: string[];
    redFlags: string[];
    suggestions?: string[];
  };
  coverLetter?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  fileName: string;
  analyzedAt: string;
}

function addText(doc: jsPDF, text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic'; color?: [number, number, number]; maxWidth?: number }): number {
  const fontSize = options?.fontSize || 11;
  const fontStyle = options?.fontStyle || 'normal';
  const color = options?.color || [0, 0, 0];
  const maxWidth = options?.maxWidth || 180;

  doc.setFontSize(fontSize);
  doc.setFont('helvetica', fontStyle);
  doc.setTextColor(...color);

  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);

  return y + lines.length * (fontSize * 0.5) + 2;
}

function addSectionHeader(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // indigo-700
  doc.text(title, 14, y);
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, y + 1, 196, y + 1);
  return y + 8;
}

function addBulletList(doc: jsPDF, items: string[], y: number, x: number = 18): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85); // slate-700

  for (const item of items) {
    const bullet = '\u2022  ';
    const lines = doc.splitTextToSize(bullet + item, 170);
    doc.text(lines, x, y);
    y += lines.length * 5 + 2;
  }
  return y + 4;
}

function addScoreBox(doc: jsPDF, label: string, score: number, y: number, x: number): number {
  const color: [number, number, number] = score >= 80 ? [16, 185, 129] : score >= 60 ? [245, 158, 11] : [239, 68, 68];
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(label, x, y);
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(`${score}/100`, x, y + 8);
  
  return y + 18;
}

export function generateAnalysisPDF(data: AnalysisReportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 20;

  // Header
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // indigo-700
  doc.text('Aura Resume', 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('ATS Compatibility Analysis Report', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`File: ${data.fileName}`, 14, y);
  doc.text(`Analyzed: ${data.analyzedAt}`, 14, y + 5);
  doc.text(`Credits Used: ${data.creditsUsed} | Remaining: ${data.creditsRemaining}`, 14, y + 10);
  y += 20;

  // Resume Analysis
  if (data.resume) {
    y = addSectionHeader(doc, 'Resume Analysis', y);
    
    y = addScoreBox(doc, 'Overall ATS Score', data.resume.score, y, 14);
    
    if (data.resume.strengths.length > 0) {
      y = addSectionHeader(doc, 'Strengths', y);
      y = addBulletList(doc, data.resume.strengths, y);
    }

    if (data.resume.redFlags.length > 0) {
      y = addSectionHeader(doc, 'Critical Red Flags', y);
      y = addBulletList(doc, data.resume.redFlags, y);
    }

    if (data.resume.suggestions && data.resume.suggestions.length > 0) {
      y = addSectionHeader(doc, 'Improvement Suggestions', y);
      y = addBulletList(doc, data.resume.suggestions, y);
    }

    if (data.resume.keywordGaps && data.resume.keywordGaps.length > 0) {
      y = addSectionHeader(doc, 'Keyword Gaps', y);
      y = addBulletList(doc, data.resume.keywordGaps, y);
    }
  }

  // LinkedIn Analysis
  if (data.linkedin) {
    y += 5;
    y = addSectionHeader(doc, 'LinkedIn Profile Analysis', y);
    
    y = addScoreBox(doc, 'LinkedIn Score', data.linkedin.score, y, 14);
    
    if (data.linkedin.strengths.length > 0) {
      y = addSectionHeader(doc, 'Strengths', y);
      y = addBulletList(doc, data.linkedin.strengths, y);
    }

    if (data.linkedin.redFlags.length > 0) {
      y = addSectionHeader(doc, 'Areas for Improvement', y);
      y = addBulletList(doc, data.linkedin.redFlags, y);
    }

    if (data.linkedin.suggestions && data.linkedin.suggestions.length > 0) {
      y = addSectionHeader(doc, 'Recommendations', y);
      y = addBulletList(doc, data.linkedin.suggestions, y);
    }
  }

  // Cover Letter
  if (data.coverLetter) {
    y += 5;
    y = addSectionHeader(doc, 'Generated Cover Letter', y);
    y = addText(doc, data.coverLetter, 14, y, { fontSize: 10, maxWidth: 180 });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated by Aura Resume | ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}