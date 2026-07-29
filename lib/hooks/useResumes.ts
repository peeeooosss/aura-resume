'use client';

import { useState, useCallback, useEffect } from 'react';

export function useResumes() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resumes');
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch {
      setResumes([]);
    }
    setLoading(false);
  };

  const createResume = useCallback(async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('resume', file);

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
      const err = await res.json();
      throw new Error(err.error || 'Analysis failed');
    } catch (err) {
      throw err;
    }
  }, []);

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
