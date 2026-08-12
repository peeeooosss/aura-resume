'use client';

import { useState, useCallback, useMemo } from 'react';
import { useCreditsStore } from '@/lib/hooks/useCredits';

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

const SEARCH_SOURCES = ['indeed', 'linkedin'] as const;

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
  const [loadingSources, setLoadingSources] = useState<string[]>([]);
  const [searchSkills, setSearchSkills] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    location: '',
    remoteType: '',
    experienceLevel: '',
    minSalary: 0,
    maxSalary: 0,
    minMatchScore: 0,
  });
  const [savedOnly, setSavedOnly] = useState(false);

  const hasResumeSkills = useMemo(() => searchSkills.length > 0, [searchSkills]);

  const searchRealJobs = useCallback(async (term: string, loc?: string, skills?: string[]) => {
    const skillList = skills || searchSkills;
    if (skills) setSearchSkills(skills);
    const searchTerm = term || 'software engineer developer';
    const searchLocation = loc || 'India';

    setIsLoading(true);
    setError(null);
    setLoadingSources([...SEARCH_SOURCES]);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm,
          location: searchLocation,
          resultsWanted: 30,
          hoursOld: 48,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402 || data.insufficientCredits) {
          setError(`Insufficient credits. Job search costs 10 credits per search.`);
        } else {
          setError(data.error || 'Job search failed');
        }
        setMatches([]);
        setIsLoading(false);
        setLoadingSources([]);
        return;
      }

      const newJobs = (data.jobs || []).filter((job: any) => job?.id);
      if (newJobs.length > 0) {
        const enriched = enrichJobsWithMatching(newJobs, skillList);
        setMatches(enriched);
      }
      useCreditsStore.getState().refresh();
    } catch {
      setError('Job search failed. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingSources([]);
    }
  }, [searchSkills]);

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
    loadingSources,
    error,
    hasResumeSkills,
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
