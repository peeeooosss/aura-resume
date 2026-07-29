'use client';

import { useState, useCallback, useEffect } from 'react';
import { PORTFOLIO_TEMPLATES, DEFAULT_PORTFOLIO_CONTENT, type TemplateId } from '@/lib/constants/templates';

export interface Portfolio {
  id: string;
  userId: string;
  resumeId?: string;
  slug: string;
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
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (portfolios.length > 0 && !currentPortfolio) {
      setCurrentPortfolio(portfolios[0]);
    }
  }, [portfolios, currentPortfolio]);

  const createPortfolio = useCallback(async (resumeId?: string) => {
    const baseContent = { ...DEFAULT_PORTFOLIO_CONTENT };

    const newPortfolio: Portfolio = {
      id: `port_${Date.now()}`,
      userId: '',
      resumeId,
      slug: `user-${Date.now()}`,
      template: 'modern',
      theme: PORTFOLIO_TEMPLATES[0].defaultTheme,
      ...baseContent,
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      testimonials: [],
      contact: { email: '', linkedin: '', github: '', twitter: '', calendar: '' },
      seo: { title: '', description: '', image: '' },
      isPublished: false,
      views: 0,
      uniqueVisitors: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPortfolios(prev => [newPortfolio, ...prev]);
    setCurrentPortfolio(newPortfolio);
    setEditing(true);
    return newPortfolio;
  }, []);

  const updatePortfolio = useCallback((updates: Partial<Portfolio>) => {
    setPortfolios(prev => prev.map(p =>
      p.id === currentPortfolio?.id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
    setCurrentPortfolio(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
  }, [currentPortfolio]);

  const publishPortfolio = useCallback(async (slug: string) => {
    if (!currentPortfolio) return;

    updatePortfolio({
      slug,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      seo: {
        ...currentPortfolio.seo,
        title: `${currentPortfolio.hero.headline} | ${currentPortfolio.hero.subheadline}`,
        description: currentPortfolio.about.slice(0, 160),
        image: currentPortfolio.hero.avatar,
      },
    });
  }, [currentPortfolio, updatePortfolio]);

  const switchTemplate = useCallback((templateId: string) => {
    updatePortfolio({ template: templateId as any });
  }, [updatePortfolio]);

  const updateTheme = useCallback((theme: Partial<Portfolio['theme']>) => {
    updatePortfolio({
      theme: {
        primaryColor: '#6366f1',
        font: 'Inter',
        borderRadius: 'rounded-xl',
        spacing: 'normal',
        ...currentPortfolio?.theme,
        ...theme,
      },
    });
  }, [currentPortfolio, updatePortfolio]);

  return {
    portfolios,
    currentPortfolio,
    editing,
    setEditing,
    setCurrentPortfolio,
    createPortfolio,
    updatePortfolio,
    publishPortfolio,
    switchTemplate,
    updateTheme,
  };
}
