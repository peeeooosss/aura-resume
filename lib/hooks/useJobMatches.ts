'use client';

import { useState, useCallback, useMemo } from 'react';
import { MOCK_JOB_MATCHES } from '@/lib/mock/jobData';
import { MOCK_RESUMES } from '@/lib/mock/resumeData';

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

export function useJobMatches(resumeId?: string) {
  const [matches, setMatches] = useState<JobMatch[]>(MOCK_JOB_MATCHES as JobMatch[]);
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

  const primaryResume = useMemo(() => 
    MOCK_RESUMES.find(r => r.isPrimary) || MOCK_RESUMES[0], 
  []);

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
      resumeId: resumeId || 'res_1',
      jobDescription: match.description,
      jobTitle: match.title,
      company: match.company,
      tailoredText: `TAILORED RESUME FOR ${match.title} AT ${match.company.toUpperCase()}\n\nThis resume has been optimized for the specific job description...`,
      matchScore: Math.min(match.matchScore + 15, 98),
      matchedKeywords: match.matchedSkills,
      missingKeywords: match.missingSkills,
      createdAt: new Date().toISOString(),
    };
  }, [matches, resumeId]);

  return {
    matches: filteredMatches,
    allMatches: matches,
    primaryResume,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    savedOnly,
    setSavedOnly,
    toggleSave,
    apply,
    generateTailoredResume,
    stats: {
      total: matches.length,
      saved: matches.filter(m => m.isSaved).length,
      applied: matches.filter(m => m.status === 'APPLIED').length,
      avgMatchScore: Math.round(matches.reduce((a, b) => a + b.matchScore, 0) / matches.length),
    },
  };
}