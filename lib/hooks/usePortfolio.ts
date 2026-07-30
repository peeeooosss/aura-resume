'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PORTFOLIO_TEMPLATES, DEFAULT_PORTFOLIO_CONTENT, type TemplateId } from '@/lib/constants/templates';

export interface Portfolio {
  id: string;
  userId: string;
  resumeId?: string;
  slug: string;
  title?: string;
  description?: string;
  template: TemplateId;
  theme: {
    primaryColor: string;
    font: string;
    borderRadius: string;
    spacing: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    avatar: string;
  };
  about: string;
  skills: Array<{ category: string; items: string[] }>;
  experience: Array<any>;
  projects: Array<any>;
  education: Array<any>;
  certifications: Array<any>;
  testimonials: Array<any>;
  contact: {
    email: string;
    linkedin: string;
    github: string;
    twitter: string;
    calendar: string;
  };
  seo: {
    title: string;
    description: string;
    image: string;
  };
  enabledSections: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  uniqueVisitors: number;
  createdAt: string;
  updatedAt: string;
}

export function usePortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPortfolios = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (res.ok) {
        setPortfolios(data.portfolios || []);
      }
    } catch (err) {
      console.error('Failed to fetch portfolios:', err);
    }
  }, []);

  const fetchPortfolio = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolio/${id}`);
      const data = await res.json();
      if (res.ok) {
        const p = data.portfolio;
        const portfolio: Portfolio = {
          id: p.id,
          userId: p.userId,
          resumeId: p.resumeId,
          slug: p.slug,
          template: p.template || 'modern',
          theme: p.theme || PORTFOLIO_TEMPLATES[0].defaultTheme,
          hero: p.data?.hero || DEFAULT_PORTFOLIO_CONTENT.hero,
          about: p.data?.about || '',
          skills: p.data?.skills || [],
          experience: p.data?.experience || [],
          projects: p.data?.projects || [],
          education: p.data?.education || [],
          certifications: p.data?.certifications || [],
          testimonials: p.data?.testimonials || [],
          contact: p.data?.contact || DEFAULT_PORTFOLIO_CONTENT.contact,
          seo: p.data?.seo || DEFAULT_PORTFOLIO_CONTENT.seo,
          enabledSections: p.data?.enabledSections || ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact'],
          isPublished: p.isPublished,
          publishedAt: p.publishedAt,
          views: p.views,
          uniqueVisitors: p.uniqueVisitors,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
        setCurrentPortfolio(portfolio);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const createPortfolio = useCallback(async (resumeId: string, title: string, slug: string, template: string, theme: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, title, slug, template, theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create portfolio');

      const p = data.portfolio;
      const portfolio: Portfolio = {
        id: p.id,
        userId: p.userId,
        resumeId: p.resumeId,
        slug: p.slug,
        template: p.template || 'modern',
        theme: p.theme || PORTFOLIO_TEMPLATES[0].defaultTheme,
        hero: p.data?.hero || DEFAULT_PORTFOLIO_CONTENT.hero,
        about: p.data?.about || '',
        skills: p.data?.skills || [],
        experience: p.data?.experience || [],
        projects: p.data?.projects || [],
        education: p.data?.education || [],
        certifications: p.data?.certifications || [],
        testimonials: p.data?.testimonials || [],
        contact: p.data?.contact || DEFAULT_PORTFOLIO_CONTENT.contact,
        seo: p.data?.seo || DEFAULT_PORTFOLIO_CONTENT.seo,
        enabledSections: p.data?.enabledSections || ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact'],
        isPublished: p.isPublished,
        views: p.views,
        uniqueVisitors: p.uniqueVisitors,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };

      setPortfolios(prev => [portfolio, ...prev]);
      setCurrentPortfolio(portfolio);
      return portfolio;
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePortfolio = useCallback((updates: Partial<Portfolio>) => {
    setCurrentPortfolio(prev => {
      if (!prev) return null;
      return { ...prev, ...updates, updatedAt: new Date().toISOString() };
    });

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const current = currentPortfolio;
        if (!current) return;

        const apiUpdates: Record<string, any> = {};
        if (updates.title !== undefined) apiUpdates.title = updates.title;
        if (updates.slug !== undefined) apiUpdates.slug = updates.slug;
        if (updates.template !== undefined) apiUpdates.template = updates.template;
        if (updates.theme !== undefined) apiUpdates.theme = updates.theme;
        if (updates.description !== undefined) apiUpdates.description = updates.description;

        const dataFields = ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'certifications', 'testimonials', 'contact', 'seo', 'enabledSections'];
        const dataUpdates: Record<string, any> = {};
        for (const field of dataFields) {
          if ((updates as any)[field] !== undefined) {
            dataUpdates[field] = (updates as any)[field];
          }
        }
        if (Object.keys(dataUpdates).length > 0) {
          apiUpdates.data = { ...(current as any), ...dataUpdates };
          for (const key of dataFields) {
            if ((updates as any)[key] !== undefined) {
              (apiUpdates.data as any)[key] = (updates as any)[key];
            }
          }
        }

        if (Object.keys(apiUpdates).length === 0) return;

        const res = await fetch(`/api/portfolio/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiUpdates),
        });

        if (res.ok) {
          setPortfolios(prev => prev.map(p =>
            p.id === current.id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ));
        }
      } catch (err) {
        console.error('Failed to save portfolio:', err);
      } finally {
        setSaving(false);
      }
    }, 1000);
  }, [currentPortfolio]);

  const publishPortfolio = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${id}/publish`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        const p = data.portfolio;
        setCurrentPortfolio(prev => prev ? { ...prev, isPublished: p.isPublished, publishedAt: p.publishedAt } : null);
        setPortfolios(prev => prev.map(port =>
          port.id === id ? { ...port, isPublished: p.isPublished, publishedAt: p.publishedAt } : port
        ));
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  }, []);

  const deletePortfolio = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPortfolios(prev => prev.filter(p => p.id !== id));
        setCurrentPortfolio(prev => prev?.id === id ? null : prev);
      }
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
    }
  }, []);

  return {
    portfolios,
    currentPortfolio,
    loading,
    saving,
    fetchPortfolios,
    fetchPortfolio,
    createPortfolio,
    updatePortfolio,
    publishPortfolio,
    deletePortfolio,
    setCurrentPortfolio,
  };
}
