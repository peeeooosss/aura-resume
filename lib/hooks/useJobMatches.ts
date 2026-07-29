'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  jobType: string;
  experienceLevel: string;
  remoteType: string;
  postedAt: string;
  applyUrl: string;
  source: string;
  sourceJobId: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchBreakdown: Record<string, number>;
  matchReasoning: string;
  status: 'NEW' | 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  isSaved: boolean;
  appliedAt?: string;
  description: string;
  requirements: string;
  benefits: string[];
}

function getResumeSkills(): string[] {
  try {
    const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
    const latestId = Object.keys(analyses).sort().pop();
    if (!latestId) return [];
    const analysis = analyses[latestId];
    const resume = analysis?.resume;
    if (!resume) return [];

    const skills = new Set<string>();
    const skillKeywords = [/python/i, /javascript/i, /typescript/i, /react/i, /angular/i, /vue/i,
      /node\.?js/i, /express/i, /django/i, /flask/i, /spring/i, /\.net/i, /java/i, /c#/i, /c\+\+/i, /go/i, /rust/i,
      /swift/i, /kotlin/i, /ruby/i, /php/i, /scala/i, /aws/i, /azure/i, /gcp/i, /cloud/i,
      /docker/i, /kubernetes/i, /k8s/i, /ci\/cd/i, /jenkins/i, /terraform/i, /ansible/i,
      /sql/i, /postgres/i, /mysql/i, /mongodb/i, /redis/i, /nosql/i, /elasticsearch/i,
      /graphql/i, /rest/i, /api/i, /microservice/i, /machine learning/i, /deep learning/i,
      /tensorflow/i, /pytorch/i, /nlp/i, /computer vision/i, /data sci/i, /analytics/i,
      /spark/i, /hadoop/i, /kafka/i, /linux/i, /git/i, /agile/i, /scrum/i, /devops/i];

    const allText = [
      ...(resume.strengths || []),
      ...(resume.keywordGaps || []),
      ...(resume.suggestions || []),
      resume.originalText || '',
    ].join(' ');

    for (const kw of skillKeywords) {
      if (kw.test(allText)) {
        skills.add(kw.source.replace(/\?/g, '').replace(/\\/g, ''));
      }
    }

    for (const word of allText.split(/[\s,;]+/)) {
      const w = word.trim().replace(/[^a-zA-Z0-9#+./-]/g, '');
      if (w.length > 2 && /[A-Z]/.test(w) && !/^(the|and|for|with|from|that|this|have|been|were|was|are|not)$/i.test(w)) {
        skills.add(w);
      }
    }

    return Array.from(skills).slice(0, 30);
  } catch {
    return [];
  }
}

function enrichJobsWithMatching(jobs: any[], resumeSkills: string[]): JobMatch[] {
  if (!resumeSkills.length) return jobs as JobMatch[];

  return jobs.map(job => {
    const jobText = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];

    for (const skill of resumeSkills) {
      if (jobText.includes(skill.toLowerCase().replace(/[.?/]/g, ''))) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    }

    const matchScore = resumeSkills.length > 0
      ? Math.round((matched.length / resumeSkills.length) * 100)
      : 0;

    return {
      ...job,
      matchScore,
      matchedSkills: matched.slice(0, 8),
      missingSkills: missing.slice(0, 8),
      matchBreakdown: { skills: matchScore, experience: matchScore, location: 80, salary: 60, culture: 70 },
      matchReasoning: matched.length > 0
        ? `Strong match: ${matched.length} of ${resumeSkills.length} skills align. Top matches: ${matched.slice(0, 4).join(', ')}.`
        : 'Upload your resume to see skill matching.',
    };
  });
}

export function useJobMatches() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    remoteType: '',
    experienceLevel: '',
    minSalary: 0,
    maxSalary: 0,
    minMatchScore: 0,
  });
  const [savedOnly, setSavedOnly] = useState(false);

  const resumeSkills = useMemo(() => getResumeSkills(), []);

  const searchRealJobs = useCallback(async (term: string, loc?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm: term || 'software engineer developer',
          location: loc || 'India',
          resultsWanted: 20,
          hoursOld: 72,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');

      const enriched = enrichJobsWithMatching(data.jobs, resumeSkills);
      setMatches(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Job search failed');
    } finally {
      setIsLoading(false);
    }
  }, [resumeSkills]);

  useEffect(() => {
    searchRealJobs('software engineer developer data', 'India');
  }, []);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (savedOnly && !match.isSaved) return false;
      if (searchQuery && !match.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !match.company.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.location && !match.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.remoteType && match.remoteType !== filters.remoteType) return false;
      if (filters.experienceLevel && match.experienceLevel !== filters.experienceLevel) return false;
      if (filters.minSalary && match.salaryMax < filters.minSalary) return false;
      if (filters.maxSalary && match.salaryMin > filters.maxSalary) return false;
      if (filters.minMatchScore && match.matchScore < filters.minMatchScore) return false;
      return true;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [matches, searchQuery, filters, savedOnly]);

  const toggleSave = useCallback((jobId: string) => {
    setMatches(prev => prev.map(m =>
      m.id === jobId ? { ...m, isSaved: !m.isSaved } : m
    ));
  }, []);

  const apply = useCallback((jobId: string) => {
    setMatches(prev => prev.map(m =>
      m.id === jobId ? { ...m, status: 'APPLIED', appliedAt: new Date().toISOString() } : m
    ));
  }, []);

  const generateTailoredResume = useCallback(async (jobId: string) => {
    const match = matches.find(m => m.id === jobId);
    if (!match) return null;
    await new Promise(r => setTimeout(r, 2000));
    return {
      id: `tailored_${Date.now()}`,
      resumeId: 'res_1',
      jobDescription: match.description,
      jobTitle: match.title,
      company: match.company,
      tailoredText: `TAILORED RESUME FOR ${match.title} AT ${match.company.toUpperCase()}\n\nThis resume has been optimized for the specific job description...`,
      matchScore: Math.min(match.matchScore + 15, 98),
      matchedKeywords: match.matchedSkills,
      missingKeywords: match.missingSkills,
      createdAt: new Date().toISOString(),
    };
  }, [matches]);

  return {
    matches: filteredMatches,
    allMatches: matches,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    savedOnly,
    setSavedOnly,
    isLoading,
    error,
    searchRealJobs,
    toggleSave,
    apply,
    generateTailoredResume,
    stats: {
      total: matches.length,
      saved: matches.filter(m => m.isSaved).length,
      applied: matches.filter(m => m.status === 'APPLIED').length,
      avgMatchScore: matches.length > 0
        ? Math.round(matches.reduce((a, b) => a + b.matchScore, 0) / matches.length)
        : 0,
    },
  };
}
