import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobs } from 'ts-jobspy';

const VALID_SOURCES = ['indeed', 'linkedin'] as const;
type ValidSource = typeof VALID_SOURCES[number];

interface JobSearchParams {
  searchTerm: string;
  location?: string;
  source?: ValidSource;
  resultsWanted?: number;
  hoursOld?: number;
  countryIndeed?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchTerm, location, source, ...params } = body as JobSearchParams;

    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term required' }, { status: 400 });
    }

    const sites = source && VALID_SOURCES.includes(source)
      ? [source as any]
      : ['linkedin', 'indeed'] as any[];

    const jobs = await scrapeJobs({
      siteName: sites,
      searchTerm,
      location: location || 'India',
      resultsWanted: params.resultsWanted || 30,
      hoursOld: params.hoursOld || 48,
      countryIndeed: params.countryIndeed || 'India',
    });

    const jobMatches = jobs.map((job, index) => ({
      id: job.id || `job-${Date.now()}-${index}`,
      title: job.title || 'Unknown Title',
      company: job.company || 'Unknown Company',
      location: job.location || 'India',
      salaryMin: job.minAmount ?? undefined,
      salaryMax: job.maxAmount ?? undefined,
      salaryCurrency: job.currency || 'INR',
      applyUrl: job.jobUrl || '',
      source: job.site || source || 'unknown',
      sourceJobId: job.id || `job-${index}`,
      description: job.description || '',
      requirements: job.description || '',
      benefits: [] as string[],
      jobType: job.jobType || 'full-time',
      experienceLevel: '',
      remoteType: job.isRemote ? 'remote' : 'onsite',
      postedAt: job.datePosted || new Date().toISOString(),
      matchScore: 0,
      matchedSkills: [] as string[],
      missingSkills: [] as string[],
      matchBreakdown: {} as Record<string, number>,
      matchReasoning: '',
      status: 'NEW' as const,
      isSaved: false,
    }));

    return NextResponse.json({
      jobs: jobMatches,
      totalFound: jobMatches.length,
      source: source || 'mixed',
    });
  } catch (error) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Job search failed' },
      { status: 500 }
    );
  }
}
