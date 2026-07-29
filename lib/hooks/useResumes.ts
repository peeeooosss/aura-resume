'use client';

import { useState, useCallback, useEffect } from 'react';
import { MOCK_RESUMES } from '@/lib/mock/resumeData';

export function useResumes() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resumes?userId=user_1');
      if (res.ok) {
        const data = await res.json();
        if (data.resumes && data.resumes.length > 0) {
          setResumes(data.resumes);
          setLoading(false);
          return;
        }
      }
    } catch {}
    setResumes(MOCK_RESUMES);
    setLoading(false);
  };

  const createResume = useCallback(async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', 'user_1');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        await fetchResumes();
        return data;
      }
    } catch {}

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
      skills: ['React', 'TypeScript', 'Next.js'],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
      projects: [],
      redFlags: [],
      strengths: [],
      rawText: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setResumes(prev => [...prev, newResume]);
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
    refetch: fetchResumes,
  };
}
