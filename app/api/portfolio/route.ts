import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        template: true,
        isPublished: true,
        views: true,
        uniqueVisitors: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error('Fetch portfolios error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();
    const { resumeId, title, slug, template, theme } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const finalSlug = slug || slugify(title);
    const existing = await prisma.portfolio.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    }

    let portfolioData: Record<string, any> = {
      hero: { headline: title, subheadline: '', ctaText: 'View Resume', ctaLink: '#resume', avatar: '' },
      about: '',
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      testimonials: [],
      contact: { email: '', linkedin: '', github: '', twitter: '', calendar: '' },
      seo: { title, description: '', image: '' },
      enabledSections: ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact'],
    };

    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
        include: {
          analyses: { where: { type: 'resume' }, orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });

      if (resume) {
        const analysis = resume.analyses[0];
        const skills = (analysis?.strengths as string[]) || [];
        const redFlags = (analysis?.redFlags as string[]) || [];
        const suggestions = (analysis?.suggestions as string[]) || [];

        portfolioData.about = resume.rawText?.slice(0, 500) || '';
        portfolioData.skills = skills.length > 0
          ? [{ category: 'Skills', items: skills }]
          : [];
      }
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        resumeId: resumeId || null,
        title,
        slug: finalSlug,
        template: template || 'modern',
        theme: theme || { primaryColor: '#6366f1', font: 'Inter', borderRadius: 'rounded-xl', spacing: 'normal' },
        data: portfolioData,
      },
    });

    return NextResponse.json({ portfolio }, { status: 201 });
  } catch (error) {
    console.error('Create portfolio error:', error);
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
  }
}
