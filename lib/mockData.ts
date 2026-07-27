import type { SingleAnalysis, DualAnalysisResult } from './types';

const resumeStrengths = [
  'ATS-friendly formatting confirmed',
  'Strong action verbs throughout resume',
  'Quantifiable achievements detected in experience',
  'Education section well-structured',
  'Consistent date formatting detected',
  'Clear career progression visible',
  'Professional summary present and concise',
  'File format compatible with major ATS systems',
  'Section headers properly labeled',
  'Contact information at top of document',
];

const resumeRedFlags = [
  'File size too large causing upload failures',
  'Missing keywords for target job description',
  'Unconventional section headers confusing parsers',
  'Tables and columns breaking ATS extraction',
  'Font encoding issues detected in headers',
  'Inconsistent bullet point formatting',
  'Missing professional summary section',
  'Skills section buried below experience',
  'No measurable results in most recent role',
  'Date format inconsistency across positions',
];

const linkedinStrengths = [
  'Professional headline includes target keywords',
  'Profile photo creates strong first impression',
  'About section optimized with relevant skills',
  'Skills section aligns with target role',
  'Recommendations from colleagues present',
  'Active posting and engagement on feed',
  'Featured section showcases key projects',
  'Custom URL enabled for professional branding',
  'Industry and location details complete',
  'Volunteer experience adds depth',
];

const linkedinRedFlags = [
  'Headline too generic, missing role keywords',
  'About section reads like a resume, not conversational',
  'Fewer than 50 connections limits network reach',
  'No recommendations from managers or peers',
  'Skills section has fewer than 10 endorsements',
  'Profile photo appears outdated or unprofessional',
  'Featured section empty or missing key projects',
  'No activity or posts in the last 90 days',
  'Experience descriptions copy-pasted from resume',
  'Missing custom URL — using default numeric ID',
];

const sharedFlags = [
  'Quantifiable achievements missing from both sources',
  'Target role keywords not prominent enough',
  'Lack of industry-specific certifications',
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSingle(source: 'resume' | 'linkedin'): SingleAnalysis {
  const strengths = source === 'resume' ? resumeStrengths : linkedinStrengths;
  const flags = source === 'resume' ? resumeRedFlags : linkedinRedFlags;
  const baseScore = source === 'resume' ? 45 : 50;
  const score = Math.floor(Math.random() * 30) + baseScore;
  return {
    source,
    score,
    strengths: pickRandom(strengths, 3 + Math.floor(Math.random() * 2)),
    redFlags: pickRandom(flags, 4 + Math.floor(Math.random() * 2)),
    overlappingFlags: pickRandom(sharedFlags, Math.random() > 0.5 ? 1 : 2),
  };
}

export function generateMockAnalysis(resumeFileName?: string, linkedinUrl?: string): DualAnalysisResult {
  const hasResume = !!resumeFileName;
  const hasLinkedin = !!linkedinUrl;
  const result: DualAnalysisResult = {
    id: Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
  };
  if (hasResume) {
    result.resume = generateSingle('resume');
  }
  if (hasLinkedin) {
    result.linkedin = generateSingle('linkedin');
  }
  return result;
}
