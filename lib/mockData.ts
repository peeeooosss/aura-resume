import type { SingleAnalysis, DualAnalysisResult, JobRolePotential } from './types';

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

function generateJobRolePotential(source: 'resume' | 'linkedin'): JobRolePotential {
  const resumeRoles = [
    { title: 'Senior Software Engineer', matchScore: 85, company: 'Tech Startup', salaryRange: '₹25L-40L', requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'] },
    { title: 'Full Stack Developer', matchScore: 78, company: 'MNC', salaryRange: '₹18L-30L', requiredSkills: ['JavaScript', 'Python', 'Docker', 'Kubernetes', 'GraphQL'] },
    { title: 'Backend Engineer', matchScore: 72, company: 'Enterprise', salaryRange: '₹20L-35L', requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'SQL', 'System Design'] },
    { title: 'Tech Lead', matchScore: 65, company: 'Scale-up', salaryRange: '₹35L-55L', requiredSkills: ['Architecture', 'Team Leadership', 'Mentoring', 'DevOps', 'Cloud'] },
    { title: 'Engineering Manager', matchScore: 58, company: 'Big Tech', salaryRange: '₹45L-70L', requiredSkills: ['People Management', 'Strategy', 'Hiring', 'Budgeting', 'Cross-functional'] },
  ];
  
  const linkedinRoles = [
    { title: 'Product Manager', matchScore: 82, company: 'Tech Startup', salaryRange: '₹28L-45L', requiredSkills: ['Product Strategy', 'Analytics', 'User Research', 'Roadmapping', 'SQL'] },
    { title: 'Technical Program Manager', matchScore: 75, company: 'Enterprise', salaryRange: '₹25L-40L', requiredSkills: ['Project Management', 'Stakeholder Management', 'Agile', 'Risk Management', 'Technical Writing'] },
    { title: 'Solutions Architect', matchScore: 70, company: 'MNC', salaryRange: '₹30L-50L', requiredSkills: ['Cloud Architecture', 'Pre-sales', 'Customer Facing', 'AWS/Azure', 'Security'] },
    { title: 'Engineering Manager', matchScore: 62, company: 'Scale-up', salaryRange: '₹40L-60L', requiredSkills: ['Team Building', 'Technical Strategy', 'Delivery', 'Hiring', 'Culture'] },
    { title: 'VP Engineering', matchScore: 48, company: 'Big Tech', salaryRange: '₹80L-1.5Cr', requiredSkills: ['Org Design', 'Executive Presence', 'P&L', 'Board Reporting', 'M&A'] },
  ];
  
  const roles = source === 'resume' ? resumeRoles : linkedinRoles;
  const selectedRoles = roles.slice(0, 3 + Math.floor(Math.random() * 3));
  
  const resumeSkillsGap = [
    { skill: 'System Design', importance: 'high' as const, currentLevel: 'Intermediate', targetLevel: 'Advanced' },
    { skill: 'Kubernetes', importance: 'high' as const, currentLevel: 'Beginner', targetLevel: 'Intermediate' },
    { skill: 'GraphQL', importance: 'medium' as const, currentLevel: 'Beginner', targetLevel: 'Intermediate' },
    { skill: 'AWS', importance: 'high' as const, currentLevel: 'Intermediate', targetLevel: 'Advanced' },
    { skill: 'Testing (Unit/E2E)', importance: 'medium' as const, currentLevel: 'Intermediate', targetLevel: 'Advanced' },
    { skill: 'CI/CD', importance: 'medium' as const, currentLevel: 'Beginner', targetLevel: 'Intermediate' },
    { skill: 'TypeScript', importance: 'high' as const, currentLevel: 'Advanced', targetLevel: 'Expert' },
    { skill: 'PostgreSQL', importance: 'low' as const, currentLevel: 'Intermediate', targetLevel: 'Advanced' },
  ];
  
  const linkedinSkillsGap = [
    { skill: 'Product Analytics', importance: 'high' as const, currentLevel: 'Beginner', targetLevel: 'Intermediate' },
    { skill: 'User Research', importance: 'high' as const, currentLevel: 'Beginner', targetLevel: 'Intermediate' },
    { skill: 'A/B Testing', importance: 'medium' as const, currentLevel: 'Beginner', targetLevel: 'Intermediate' },
    { skill: 'SQL for Analytics', importance: 'high' as const, currentLevel: 'Intermediate', targetLevel: 'Advanced' },
    { skill: 'Roadmapping Tools', importance: 'medium' as const, currentLevel: 'Beginner', targetLevel: 'Intermediate' },
    { skill: 'Stakeholder Management', importance: 'high' as const, currentLevel: 'Intermediate', targetLevel: 'Advanced' },
    { skill: 'Technical Writing', importance: 'low' as const, currentLevel: 'Intermediate', targetLevel: 'Advanced' },
    { skill: 'Agile Methodologies', importance: 'medium' as const, currentLevel: 'Advanced', targetLevel: 'Expert' },
  ];
  
  const skillsGap = (source === 'resume' ? resumeSkillsGap : linkedinSkillsGap).slice(0, 5 + Math.floor(Math.random() * 3));
  
  return {
    potentialRoles: selectedRoles,
    skillsGap,
    salaryRange: {
      minimum: '₹15L',
      maximum: '₹60L',
      average: '₹32L',
    },
    matchReasoning: `Based on your ${source === 'resume' ? 'resume' : 'LinkedIn profile'}, you have strong fundamentals in ${source === 'resume' ? 'software development' : 'product and technical management'}. The roles recommended align with your ${selectedRoles.length > 2 ? 'diverse' : 'specialized'} skill set and ${source === 'resume' ? 'hands-on engineering experience' : 'strategic and cross-functional experience'}. Focus on closing the high-importance skill gaps to improve match scores for senior roles.`,
  };
}

function generateSingle(source: 'resume' | 'linkedin'): SingleAnalysis {
  const strengths = source === 'resume' ? resumeStrengths : linkedinStrengths;
  const flags = source === 'resume' ? resumeRedFlags : linkedinRedFlags;
  const baseScore = source === 'resume' ? 45 : 50;
  const score = Math.floor(Math.random() * 30) + baseScore;
  const mockResumeText = `JOHN DOE
Software Engineer | john.doe@email.com | +91-9876543210 | Bangalore, India

SUMMARY
Results-driven software engineer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, TypeScript, and cloud technologies.

EXPERIENCE

Senior Software Engineer | TechCorp India | Jan 2022 - Present
- Led development of microservices architecture serving 10M+ users
- Reduced API response time by 40% through query optimization
- Mentored team of 3 junior developers
- Implemented CI/CD pipeline reducing deployment time by 60%

Software Engineer | StartupXYZ | Jun 2019 - Dec 2021
- Built React-based dashboard used by 5000+ enterprise clients
- Developed REST APIs with Node.js and PostgreSQL
- Integrated third-party payment gateways (Razorpay, Stripe)

EDUCATION

B.Tech Computer Science | IIT Bangalore | 2019

SKILLS
JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, Git, REST APIs, GraphQL`;

  return {
    source,
    score,
    strengths: pickRandom(strengths, 3 + Math.floor(Math.random() * 2)),
    redFlags: pickRandom(flags, 4 + Math.floor(Math.random() * 2)),
    overlappingFlags: pickRandom(sharedFlags, Math.random() > 0.5 ? 1 : 2),
    jobRolePotential: generateJobRolePotential(source),
    originalText: source === 'resume' ? mockResumeText : undefined,
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
