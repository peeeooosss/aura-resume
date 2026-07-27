'use client';

import { useState, useCallback, useEffect } from 'react';
import { MOCK_RESUMES } from '@/lib/mock/resumeData';

const STORAGE_KEY = 'aura_resumes';

export function useResumes() {
  const [resumes, setResumes] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return MOCK_RESUMES;
        }
      }
    }
    return MOCK_RESUMES;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  }, [resumes]);

  const createResume = useCallback(async (file: File): Promise<any> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const newResume = {
      id: `res_${Date.now()}`,
      userId: 'user_1',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      status: 'PARSED',
      isPrimary: resumes.length === 0,
      version: 1,
      atsScore: Math.floor(Math.random() * 30) + 60,
      atsBreakdown: {
        formatting: Math.floor(Math.random() * 20) + 80,
        keywords: Math.floor(Math.random() * 30) + 60,
        sections: Math.floor(Math.random() * 15) + 80,
        readability: Math.floor(Math.random() * 25) + 65,
        contact: 100,
      },
      skills: ['React', 'TypeScript', 'Next.js'],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
      projects: [],
      redFlags: [],
      strengths: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setResumes(prev => [...prev, newResume]);
    setLoading(false);
    return newResume;
  }, [resumes.length]);

  const updateResume = useCallback((id: string, updates: Partial<any>) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
  }, []);

  const deleteResume = useCallback((id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
  }, []);

  const setPrimary = useCallback((id: string) => {
    setResumes(prev => prev.map(r => ({ ...r, isPrimary: r.id === id })));
  }, []);

  const getPrimary = useCallback(() => {
    return resumes.find(r => r.isPrimary) || resumes[0];
  }, [resumes]);

  return {
    resumes,
    loading,
    createResume,
    updateResume,
    deleteResume,
    setPrimary,
    getPrimary,
  };
}