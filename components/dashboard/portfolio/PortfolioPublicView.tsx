'use client';

import { PortfolioPreview } from './PortfolioPreview';

interface PortfolioPublicViewProps {
  portfolio: {
    title: string;
    slug: string;
    template: string;
    theme: any;
    data: any;
    views: number;
    userName: string;
  };
}

export function PortfolioPublicView({ portfolio }: PortfolioPublicViewProps) {
  const portfolioData = {
    id: '',
    userId: '',
    slug: portfolio.slug,
    template: portfolio.template as any,
    theme: portfolio.theme || { primaryColor: '#6366f1', font: 'Inter', borderRadius: 'rounded-xl', spacing: 'normal' },
    hero: portfolio.data?.hero || { headline: portfolio.title, subheadline: '', ctaText: '', ctaLink: '', avatar: '' },
    about: portfolio.data?.about || '',
    skills: portfolio.data?.skills || [],
    experience: portfolio.data?.experience || [],
    projects: portfolio.data?.projects || [],
    education: portfolio.data?.education || [],
    certifications: portfolio.data?.certifications || [],
    testimonials: portfolio.data?.testimonials || [],
    contact: portfolio.data?.contact || { email: '', linkedin: '', github: '', twitter: '', calendar: '' },
    seo: portfolio.data?.seo || { title: portfolio.title, description: '', image: '' },
    isPublished: true,
    views: portfolio.views,
    uniqueVisitors: 0,
    createdAt: '',
    updatedAt: '',
  };

  return <PortfolioPreview portfolio={portfolioData} isPublic />;
}
