'use client';

import { useState, useEffect } from 'react';
import { useResumes } from '@/lib/hooks/useResumes';
import { usePlan } from '@/lib/hooks/usePlan';
import { PlanGate } from '@/components/dashboard/PlanGate';
import { FileText, Wrench, Download, AlertTriangle, Check, Info, AlertCircle, ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface Resume {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  isPrimary: boolean;
  version: number;
  atsScore: number;
  atsBreakdown: {
    formatting: number;
    keywords: number;
    sections: number;
    readability: number;
    contact: number;
  };
  skills: string[];
  experience: Array<{
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    bullets: string[];
    tech: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    year: string;
    honors: string[];
  }>;
  certifications: string[];
  languages: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    tech: string[];
    link: string;
    github: string;
  }>;
  redFlags: string[];
  strengths: string[];
  rawText: string;
}

interface Fix {
  id: string;
  category: 'formatting' | 'keywords' | 'sections' | 'content' | 'readability';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  originalText: string;
  fixedText: string;
  section: string;
}

const MOCK_FIXES: Record<string, Fix[]> = {
  res_1: [
    {
      id: 'fix_1',
      category: 'keywords',
      severity: 'critical',
      title: 'Missing Critical Keywords for Target Role',
      description: 'Your resume lacks 12 of the top 20 keywords for "Senior Frontend Engineer" roles. ATS systems filter out resumes missing these terms.',
      originalText: 'Experience with React, TypeScript, and modern JavaScript frameworks.',
      fixedText: 'Experience with React, TypeScript, Next.js, Redux, GraphQL, REST APIs, Jest, Cypress, CI/CD, Docker, AWS, and modern JavaScript frameworks (ES6+).',
      section: 'Skills & Technologies'
    },
    {
      id: 'fix_2',
      category: 'formatting',
      severity: 'warning',
      title: 'Inconsistent Date Formatting',
      description: 'Employment dates use mixed formats (MM/YYYY vs Month YYYY). Standardize to Month YYYY for ATS compatibility.',
      originalText: '01/2022 - Present\n03/2020 - 12/2021',
      fixedText: 'January 2022 - Present\nMarch 2020 - December 2021',
      section: 'Experience'
    },
    {
      id: 'fix_3',
      category: 'sections',
      severity: 'critical',
      title: 'Missing Projects Section',
      description: 'No dedicated Projects section found. Adding 3-4 relevant projects with tech stacks increases keyword density by ~40%.',
      originalText: '(No projects section present)',
      fixedText: 'PROJECTS\n• E-Commerce Platform — Next.js, TypeScript, Stripe, PostgreSQL. Built full-stack shop with real-time inventory.\n• Real-time Dashboard — React, WebSockets, D3.js. 10K+ concurrent users with sub-100ms latency.\n• Design System — Storybook, Tailwind, Chromatic. Adopted by 5 teams, reduced UI dev time 60%.',
      section: 'Projects (New Section)'
    },
    {
      id: 'fix_4',
      category: 'readability',
      severity: 'warning',
      title: 'Passive Voice in Bullet Points',
      description: '6 of 12 bullet points use passive voice. Active voice improves readability score by 15+ points.',
      originalText: 'Was responsible for leading a team of 5 developers...\nThe application was built using React...',
      fixedText: 'Led a team of 5 developers to deliver...\nBuilt the application using React...',
      section: 'Experience Bullets'
    },
    {
      id: 'fix_5',
      category: 'content',
      severity: 'info',
      title: 'Quantify Achievements with Metrics',
      description: 'Only 3 of 12 bullets include measurable outcomes. Adding numbers increases recruiter engagement by 3x.',
      originalText: 'Improved application performance\nReduced bundle size\nMentored junior developers',
      fixedText: 'Improved application performance by 40% (LCP from 3.2s to 1.9s)\nReduced bundle size by 35% (2.1MB → 1.4MB) via code splitting\nMentored 3 junior developers, 2 promoted to mid-level within 12 months',
      section: 'Experience Bullets'
    },
    {
      id: 'fix_6',
      category: 'sections',
      severity: 'info',
      title: 'Add Certifications Section',
      description: 'Relevant certifications (AWS, Google Cloud) are buried in Skills. A dedicated section improves ATS parsing.',
      originalText: 'AWS Certified Solutions Architect (in Skills list)',
      fixedText: 'CERTIFICATIONS\n• AWS Certified Solutions Architect — Associate (2023)\n• Google Cloud Professional Cloud Developer (2022)\n• Scrum Master Certified (2021)',
      section: 'Certifications (New Section)'
    }
  ],
  res_2: [
    {
      id: 'fix_7',
      category: 'keywords',
      severity: 'critical',
      title: 'Missing Role-Specific Keywords',
      description: 'Resume targets "Full Stack Developer" but misses 15 key terms: Node.js, Express, MongoDB, PostgreSQL, TypeScript, GraphQL, Docker, Kubernetes, CI/CD, Jest, React Testing Library, WebSockets, Redis, Elasticsearch, Microservices.',
      originalText: 'Full stack developer with JavaScript and Python experience.',
      fixedText: 'Full Stack Developer with 5+ years building scalable applications using Node.js, Express, TypeScript, React, PostgreSQL, MongoDB, GraphQL, Docker, Kubernetes, and CI/CD pipelines.',
      section: 'Professional Summary'
    },
    {
      id: 'fix_8',
      category: 'formatting',
      severity: 'warning',
      title: 'Contact Information Not ATS-Parsable',
      description: 'LinkedIn URL and GitHub are formatted as plain text. Use standard labels for reliable extraction.',
      originalText: 'linkedin.com/in/johndoe | github.com/johndoe',
      fixedText: 'LinkedIn: linkedin.com/in/johndoe\nGitHub: github.com/johndoe',
      section: 'Contact Header'
    }
  ],
  res_3: [
    {
      id: 'fix_9',
      category: 'sections',
      severity: 'critical',
      title: 'Incomplete Education Section',
      description: 'Missing graduation year and honors. Some ATS systems flag incomplete education as a data quality issue.',
      originalText: 'Bachelor of Technology in Computer Science\nIndian Institute of Technology, Delhi',
      fixedText: 'Bachelor of Technology in Computer Science\nIndian Institute of Technology, Delhi — 2019\nHonors: Dean\'s List (2017-2019), ACM ICPC Regional Finalist',
      section: 'Education'
    }
  ]
};

function getSeverityColor(severity: Fix['severity']) {
  switch (severity) {
    case 'critical': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'info': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  }
}

function getSeverityIcon(severity: Fix['severity']) {
  switch (severity) {
    case 'critical': return <AlertCircle className="w-5 h-5" />;
    case 'warning': return <AlertTriangle className="w-5 h-5" />;
    case 'info': return <Info className="w-5 h-5" />;
  }
}

function getCategoryLabel(category: Fix['category']) {
  const labels: Record<Fix['category'], string> = {
    formatting: 'Formatting',
    keywords: 'Keywords',
    sections: 'Sections',
    content: 'Content',
    readability: 'Readability'
  };
  return labels[category];
}

function FixCard({ fix, index, isExpanded, onToggle }: { fix: Fix; index: number; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className={cn('border rounded-2xl overflow-hidden transition-all', getSeverityColor(fix.severity))}>
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start gap-4 text-left hover:bg-surface-100 dark:bg-slate-800/50 transition-colors"
      >
        <div className={cn('flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center', getSeverityColor(fix.severity).replace('text-', 'bg-').replace('border-', ''))}>
          {getSeverityIcon(fix.severity)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-surface-900 dark:text-white">{fix.title}</h4>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getSeverityColor(fix.severity))}>
              {fix.severity.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-100 dark:bg-slate-800 text-surface-500 dark:text-slate-400 text-xs font-medium">
              {getCategoryLabel(fix.category)}
            </span>
          </div>
          <p className="text-surface-500 dark:text-slate-400 text-sm line-clamp-2">{fix.description}</p>
        </div>
        <div className="flex items-center gap-2 text-surface-400 dark:text-slate-500">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-surface-200 dark:border-slate-800 p-5 space-y-4 bg-slate-900/50">
          <div>
            <h5 className="text-surface-500 dark:text-slate-400 text-sm font-medium mb-2">Section: {fix.section}</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h6 className="text-rose-400 text-sm font-medium mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Current
              </h6>
              <pre className="bg-white dark:bg-slate-950 border border-surface-200 dark:border-slate-800 rounded-xl p-4 text-surface-900 dark:text-slate-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-64">{fix.originalText}</pre>
            </div>
            <div>
              <h6 className="text-emerald-400 text-sm font-medium mb-2 flex items-center gap-1">
                <Check className="w-3 h-3" /> Fixed
              </h6>
              <pre className="bg-white dark:bg-slate-950 border border-emerald-500/20 rounded-xl p-4 text-surface-900 dark:text-slate-100 text-sm whitespace-pre-wrap overflow-x-auto max-h-64">{fix.fixedText}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadFixedResume({ resume, fixes }: { resume: Resume; fixes: Fix[] }) {
  const handleDownload = () => {
    const fixedContent = generateFixedResume(resume, fixes);
    const blob = new Blob([fixedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixed_${resume.fileName.replace('.pdf', '').replace('.docx', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 w-full md:w-auto"
    >
      <Download className="w-6 h-6" />
      <span>Download Fixed Resume</span>
      <ArrowRight className="w-5 h-5" />
    </button>
  );
}

function generateFixedResume(resume: Resume, fixes: Fix[]): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let content = `FIXED RESUME — ${resume.fileName}\n`;
  content += `Generated on ${date}\n`;
  content += `Original ATS Score: ${resume.atsScore}/100\n`;
  content += `Fixes Applied: ${fixes.length}\n`;
  content += `${'='.repeat(60)}\n\n`;

  content += `PROFESSIONAL SUMMARY\n`;
  content += `Experienced ${resume.experience[0]?.role || 'Software Engineer'} with ${resume.experience.length}+ years building scalable applications. `;
  content += `Core expertise: ${resume.skills.slice(0, 8).join(', ')}.\n\n`;

  content += `TECHNICAL SKILLS\n`;
  content += resume.skills.join(', ') + '\n\n';

  content += `EXPERIENCE\n`;
  resume.experience.forEach((exp, i) => {
    content += `${exp.role} at ${exp.company} ${exp.location ? `(${exp.location})` : ''}\n`;
    content += `${exp.startDate} ${exp.current ? '- Present' : `- ${exp.endDate}`}\n`;
    exp.bullets.forEach((bullet, bi) => {
      const fix = fixes.find(f => f.section === 'Experience Bullets' && f.originalText.includes(bullet.slice(0, 30)));
      content += `• ${fix ? fix.fixedText.split('\n')[bi] || bullet : bullet}\n`;
    });
    content += `\n`;
  });

  if (resume.projects.length > 0) {
    content += `PROJECTS\n`;
    resume.projects.forEach(proj => {
      content += `• ${proj.name} — ${proj.tech.join(', ')}. ${proj.description}\n`;
    });
    content += `\n`;
  }

  content += `EDUCATION\n`;
  resume.education.forEach(edu => {
    content += `${edu.degree}\n${edu.school} — ${edu.year}\n`;
    if (edu.honors.length) content += `Honors: ${edu.honors.join(', ')}\n`;
    content += `\n`;
  });

  if (resume.certifications.length > 0) {
    content += `CERTIFICATIONS\n`;
    resume.certifications.forEach(cert => content += `• ${cert}\n`);
    content += `\n`;
  }

  content += `LANGUAGES\n`;
  content += resume.languages.join(', ') + '\n\n';

  content += `${'='.repeat(60)}\n`;
  content += `FIXES APPLIED (${fixes.length}):\n\n`;
  fixes.forEach((fix, i) => {
    content += `${i + 1}. [${fix.severity.toUpperCase()}] ${fix.title} (${getCategoryLabel(fix.category)})\n`;
    content += `   ${fix.description}\n\n`;
  });

  return content;
}

export function FixerPage() {
  const { resumes } = useResumes();
  const currentPlan = usePlan(s => s.currentPlan);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [expandedFixes, setExpandedFixes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);
  const fixes = selectedResume ? (MOCK_FIXES[selectedResume.id] || []) : [];

  const toggleFix = (fixId: string) => {
    setExpandedFixes(prev => {
      const next = new Set(prev);
      if (next.has(fixId)) next.delete(fixId);
      else next.add(fixId);
      return next;
    });
  };

  if (resumes.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">No Resumes Found</h2>
        <p className="text-surface-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Upload a resume first to use the Resume Fixer. We'll analyze it and show you specific fixes to improve your ATS score.</p>
        <a
          href="/dashboard/resumes"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all"
        >
          <FileText className="w-5 h-5" />
          Upload Resume
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">Resume Fixer</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Select a resume to see specific fixes and download an improved version</p>
        </div>
        <PlanGate requiredPlan="pro" featureName="Resume Fixer Download">
          <DownloadFixedResume resume={selectedResume!} fixes={fixes} />
        </PlanGate>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Select Resume</h3>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fileName} {r.isPrimary && '(Primary)'}
                </option>
              ))}
            </select>
            <div className="mt-4 p-4 bg-white dark:bg-slate-950 rounded-xl border border-surface-200 dark:border-slate-800">
              <p className="text-surface-500 dark:text-slate-400 text-sm mb-2">ATS Score: <span className="text-surface-900 dark:text-white font-semibold">{selectedResume?.atsScore || 0}/100</span></p>
              <p className="text-surface-500 dark:text-slate-400 text-sm mb-2">Version: <span className="text-surface-900 dark:text-white font-semibold">v{selectedResume?.version || 1}</span></p>
              <p className="text-surface-500 dark:text-slate-400 text-sm">Status: <span className="text-emerald-400 font-semibold capitalize">{selectedResume?.status?.toLowerCase() || 'parsed'}</span></p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {fixes.length === 0 ? (
            <div className="text-center py-16 bg-white border border-surface-200 dark:bg-slate-900/50 dark:border-surface-200 dark:border-slate-800 rounded-2xl">
              <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Fixes Needed!</h3>
              <p className="text-surface-500 dark:text-slate-400">This resume looks great. No critical issues found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fixes.map((fix, i) => (
                <FixCard
                  key={fix.id}
                  fix={fix}
                  index={i}
                  isExpanded={expandedFixes.has(fix.id)}
                  onToggle={() => toggleFix(fix.id)}
                />
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-surface-200 dark:border-slate-800">
            <PlanGate requiredPlan="pro" featureName="Resume Fixer Download">
              <DownloadFixedResume resume={selectedResume!} fixes={fixes} />
            </PlanGate>
            <p className="text-surface-400 dark:text-slate-500 text-sm text-center mt-3">
              Downloads a formatted text file with all fixes applied. PDF generation coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}