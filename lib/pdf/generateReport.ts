import { jsPDF } from 'jspdf';
import type { JobRolePotential } from '@/lib/types';

export interface AnalysisReportData {
  resume?: {
    score: number;
    strengths: string[];
    redFlags: string[];
    suggestions?: string[];
    keywordGaps?: string[];
    jobRolePotential?: JobRolePotential;
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
  doc.setTextColor(30, 58, 138);
  doc.text(title, 14, y);
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, y + 1, 196, y + 1);
  return y + 8;
}

function addBulletList(doc: jsPDF, items: string[], y: number, x: number = 18): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

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

  const pageHeight = 297;
  const bottomMargin = 22;

  function checkPageBreak(neededSpace: number): boolean {
    if (y + neededSpace > pageHeight - bottomMargin) {
      doc.addPage();
      y = 22;
      return true;
    }
    return false;
  }

  let y = 20;

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('Aura Resume', 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ATS Compatibility Analysis Report', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`File: ${data.fileName}`, 14, y);
  doc.text(`Analyzed: ${data.analyzedAt}`, 14, y + 5);
  doc.text(`Credits Used: ${data.creditsUsed} | Remaining: ${data.creditsRemaining}`, 14, y + 10);
  y += 20;

  if (data.resume) {
    checkPageBreak(10);
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

    if (data.resume.jobRolePotential) {
      const jrp = data.resume.jobRolePotential;
      y += 2;
      y = addSectionHeader(doc, 'Job Role Potential', y);

      if (jrp.potentialRoles.length > 0) {
        y = addSectionHeader(doc, 'Top Matching Roles', y);
        for (const role of jrp.potentialRoles) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(51, 65, 85);
          const roleLine = `${role.title} – ${role.matchScore}% match`;
          doc.text(roleLine, 14, y);
          y += 5;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(`Company type: ${role.company}  |  Salary: ${role.salaryRange}`, 14, y);
          y += 4;

          if (role.requiredSkills.length > 0) {
            doc.text(`Required: ${role.requiredSkills.join(', ')}`, 14, y);
            y += 4;
          }
          y += 2;
        }
      }

      if (jrp.skillsGap && jrp.skillsGap.length > 0) {
        y = addSectionHeader(doc, 'Skills Gap Analysis', y);
        for (const gap of jrp.skillsGap) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          const imp = gap.importance.toUpperCase();
          const impColor: [number, number, number] =
            gap.importance === 'high' ? [239, 68, 68] : gap.importance === 'medium' ? [245, 158, 11] : [16, 185, 129];
          doc.setTextColor(...impColor);
          doc.text(`${imp}`, 14, y);

          doc.setTextColor(51, 65, 85);
          doc.text(`  ${gap.skill} (${gap.currentLevel} → ${gap.targetLevel})`, 28, y);
          y += 5;
        }
      }

      y += 2;
      y = addSectionHeader(doc, 'Salary Potential', y);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`Average: ${jrp.salaryRange.average}`, 14, y);
      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Range: ${jrp.salaryRange.minimum} – ${jrp.salaryRange.maximum}`, 14, y);
      y += 6;
    }
  }

  if (data.linkedin) {
    checkPageBreak(10);
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

  if (data.coverLetter) {
    checkPageBreak(10);
    y += 5;
    y = addSectionHeader(doc, 'Generated Cover Letter', y);
    y = addText(doc, data.coverLetter, 14, y, { fontSize: 10, maxWidth: 180 });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated by Aura Resume | ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      105,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc;
}

interface ResumeSubSection {
  header: string;
  lines: string[];
}

interface ResumeSection {
  title: string;
  subtitle?: string;
  lines: string[];
  isBulletList: boolean;
  subsections: ResumeSubSection[];
}

function parseMarkdownResume(text: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  const lines = text.split('\n');

  const sectionMap: Record<string, string> = {
    'CONTACT': 'CONTACT',
    'SUMMARY': 'SUMMARY',
    'PROFESSIONAL SUMMARY': 'SUMMARY',
    'EXPERIENCE': 'EXPERIENCE',
    'WORK EXPERIENCE': 'EXPERIENCE',
    'PROFESSIONAL EXPERIENCE': 'EXPERIENCE',
    'EDUCATION': 'EDUCATION',
    'SKILLS': 'SKILLS',
    'TECHNICAL SKILLS': 'SKILLS',
    'CERTIFICATIONS': 'CERTIFICATIONS',
    'PROJECTS': 'PROJECTS',
  };

  let currentSection: ResumeSection = { title: 'HEADER', lines: [], isBulletList: false, subsections: [] };
  let currentSubHeader: string | null = null;
  let currentSubLines: string[] = [];

  function flushSubHeader() {
    if (currentSubHeader && currentSubLines.length > 0) {
      currentSection.subsections.push({ header: currentSubHeader, lines: [...currentSubLines] });
    }
    currentSubHeader = null;
    currentSubLines = [];
  }

  function pushCurrentSection() {
    flushSubHeader();
    if (currentSection.lines.length > 0 || currentSection.subsections.length > 0) {
      sections.push(currentSection);
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const h2Match = trimmed.match(/^(\*\*)?##\s+(.+?)(\*\*)?$/);
    if (h2Match) {
      const sectionName = h2Match[2].toUpperCase().replace(/\*/g, '').trim();
      if (sectionMap[sectionName]) {
        pushCurrentSection();
        currentSection = {
          title: sectionMap[sectionName],
          lines: [],
          isBulletList: ['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'].includes(sectionMap[sectionName]),
          subsections: [],
        };
        continue;
      }
    }

    const h3Match = trimmed.match(/^(\*\*)?###\s+(.+?)(\*\*)?$/);
    if (h3Match) {
      if (['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'].includes(currentSection.title)) {
        flushSubHeader();
        currentSubHeader = h3Match[2].trim();
        currentSubLines = [];
        continue;
      }
    }

    const h1Match = trimmed.match(/^# (.+)/);
    if (h1Match) {
      if (currentSection.title === 'HEADER' && currentSection.lines.length === 0) {
        currentSection.title = 'CONTACT';
        currentSection.lines.push(h1Match[1].trim());
        continue;
      }
    }

    const upperTrimmed = trimmed.replace(/^\**#+\**\s*/, '').replace(/\*+/g, '').trim().toUpperCase();
    if (sectionMap[upperTrimmed]) {
      pushCurrentSection();
      currentSection = {
        title: sectionMap[upperTrimmed],
        lines: [],
        isBulletList: ['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'].includes(sectionMap[upperTrimmed]),
        subsections: [],
      };
      continue;
    }

    let cleaned = trimmed
      .replace(/^\*\*|\*\*$/g, '')
      .replace(/^__|__$/g, '')
      .replace(/^#+\s*/, '')
      .replace(/^- /, '')
      .replace(/^\* /, '')
      .trim();

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (currentSubHeader !== null) {
        currentSubLines.push(cleaned);
      } else {
        currentSection.lines.push(cleaned);
      }
      continue;
    }

    if (currentSubHeader !== null) {
      if (['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'].includes(currentSection.title)) {
        currentSection.lines.push(trimmed.replace(/^\*\*|\*\*$/g, '').replace(/^__|__$/g, '').trim());
      }
      continue;
    }

    currentSection.lines.push(cleaned);
  }

  pushCurrentSection();

  if (sections.length === 1 && sections[0].title === 'HEADER') {
    const headerLines: string[] = [];
    const otherSections: ResumeSection[] = [];

    for (const sec of [sections[0]]) {
      let foundBreak = false;
      for (const l of sec.lines) {
        if (!foundBreak) {
          const upperL = l.toUpperCase().replace(/\*/g, '').trim();
          if (sectionMap[upperL]) {
            otherSections.push({
              title: sectionMap[upperL],
              lines: [],
              isBulletList: ['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'].includes(sectionMap[upperL]),
              subsections: [],
            });
            foundBreak = true;
            continue;
          }
          headerLines.push(l);
        } else {
          const lastSec = otherSections[otherSections.length - 1];
          const upperL = l.toUpperCase().replace(/\*/g, '').trim();
          if (sectionMap[upperL]) {
            otherSections.push({
              title: sectionMap[upperL],
              lines: [],
              isBulletList: ['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'].includes(sectionMap[upperL]),
              subsections: [],
            });
          } else {
            lastSec.lines.push(l.replace(/^\*\*|\*\*$/g, '').replace(/^__|__$/g, '').trim());
          }
        }
      }
    }

    if (otherSections.length > 0) {
      const result: ResumeSection[] = [
        { title: 'CONTACT', lines: headerLines.slice(0, 4), isBulletList: false, subsections: [] },
      ];
      for (const s of otherSections) {
        if (s.lines.length > 0 || s.subsections.length > 0) {
          result.push(s);
        }
      }
      return result;
    }
  }

  return dedupeSections(
    sections.filter(s => s.lines.length > 0 || s.subsections.length > 0)
  );
}

function dedupeSections(sections: ResumeSection[]): ResumeSection[] {
  const singleton = new Set(['CONTACT', 'SUMMARY', 'EDUCATION', 'SKILLS']);
  const seen = new Set<string>();
  const result: ResumeSection[] = [];
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (singleton.has(s.title)) {
      if (!seen.has(s.title)) {
        seen.add(s.title);
        result.unshift(s);
      }
    } else {
      result.unshift(s);
    }
  }
  return result;
}

export function generateOptimizedResumePDF(resumeText: string, metadata: { candidateName?: string; generatedAt: string }): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const sections = parseMarkdownResume(resumeText);
  const marginLeft = 14;
  const marginRight = 196;
  const contentWidth = marginRight - marginLeft;
  const pageHeight = 297;
  const bottomMargin = 25;

  function checkPageBreak(neededSpace: number): boolean {
    if (y + neededSpace > pageHeight - bottomMargin) {
      doc.addPage();
      y = 25;
      return true;
    }
    return false;
  }

  function addPageFooter(pageNum: number, totalPages: number) {
    doc.setPage(pageNum);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`ATS-Optimized Resume | Generated by Aura Resume | ${metadata.generatedAt}`, 105, pageHeight - 8, { align: 'center' });
  }

  let y = 18;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(`ATS-Optimized by Aura Resume | Generated: ${metadata.generatedAt}`, marginLeft, y);
  y += 12;

  for (const section of sections) {
    if (section.title === 'CONTACT') {
      checkPageBreak(20);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);

      const name = metadata.candidateName || section.lines[0] || 'Resume';
      doc.text(name, marginLeft, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      for (let i = 1; i < section.lines.length; i++) {
        const line = section.lines[i];
        if (line) {
          doc.text(line, marginLeft, y);
          y += 5;
        }
      }
    } else if (section.title === 'SUMMARY') {
      y += 4;
      const summaryText = section.lines.join(' ');
      const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
      const summaryHeight = summaryLines.length * 5 + 12;
      checkPageBreak(summaryHeight);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('PROFESSIONAL SUMMARY', marginLeft, y);
      y += 1;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, y, marginRight, y);
      y += 5;

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(summaryLines, marginLeft, y);
      y += summaryLines.length * 5 + 6;
    } else if (['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'].includes(section.title)) {
      y += 2;
      const titleMap: Record<string, string> = {
        EXPERIENCE: 'PROFESSIONAL EXPERIENCE',
        EDUCATION: 'EDUCATION',
        PROJECTS: 'PROJECTS',
        CERTIFICATIONS: 'CERTIFICATIONS',
      };
      const sectionHeader = titleMap[section.title] || section.title;

      checkPageBreak(10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(sectionHeader, marginLeft, y);
      y += 1;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, y, marginRight, y);
      y += 6;

      if (section.subsections.length > 0) {
        for (const sub of section.subsections) {
          const headerLines = doc.splitTextToSize(sub.header, contentWidth);
          const subHeight = headerLines.length * 5 + 2 + sub.lines.length * 6 + 8;
          checkPageBreak(subHeight);

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text(headerLines, marginLeft, y);
          y += headerLines.length * 5 + 2;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          for (const bulletLine of sub.lines) {
            doc.setTextColor(71, 85, 105);
            const bullet = '\u2022  ';
            const bl = doc.splitTextToSize(bullet + bulletLine, contentWidth - 4);
            doc.text(bl, marginLeft + 4, y);
            y += bl.length * 4.5 + 1;
          }
          y += 4;
        }
      } else {
        for (const line of section.lines) {
          if (!line) continue;
          const isRoleHeader = line.length < 80 && !line.startsWith('-') && !line.startsWith('*') && line.includes('|');
          const lineHeight = isRoleHeader ? 6 : 6;
          checkPageBreak(lineHeight);

          if (isRoleHeader) {
            y = addText(doc, line, marginLeft, y, { fontSize: 9.5, fontStyle: 'bold', color: [51, 65, 85], maxWidth: contentWidth });
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);
            const bullet = '\u2022  ';
            const bulletLines = doc.splitTextToSize(bullet + line, contentWidth - 4);
            doc.text(bulletLines, marginLeft + 3, y);
            y += bulletLines.length * 4.5 + 1;
          }
        }
      }
    } else if (section.title === 'SKILLS') {
      y += 2;
      const skillsText = section.lines.join('  \u2022  ');
      const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
      const skillsHeight = skillsLines.length * 5 + 12;
      checkPageBreak(skillsHeight);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('SKILLS', marginLeft, y);
      y += 1;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, y, marginRight, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(skillsLines, marginLeft, y);
      y += skillsLines.length * 5 + 4;
    } else {
      y += 2;
      checkPageBreak(12);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(section.title, marginLeft, y);
      y += 1;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, y, marginRight, y);
      y += 5;

      for (const line of section.lines) {
        checkPageBreak(6);
        y = addText(doc, line, marginLeft, y, { fontSize: 9, color: [51, 65, 85], maxWidth: contentWidth });
      }
    }

    y += 2;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    addPageFooter(i, pageCount);
  }

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

export function getPDFBlobURL(doc: jsPDF): string {
  const result = doc.output('bloburl');
  if (typeof result === 'string') return result;
  return (result as URL).href;
}
