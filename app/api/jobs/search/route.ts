import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobs, SupportedSiteName } from 'ts-jobspy';
import { prisma } from '@/lib/db';
import { CREDIT_COSTS } from '@/lib/constants/credits';

interface JobSearchParams {
  searchTerm: string;
  location?: string;
  siteName?: SupportedSiteName[];
  resultsWanted?: number;
  hoursOld?: number;
  countryIndeed?: string;
  linkedinFetchDescription?: boolean;
  remoteOnly?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchTerm, location, ...params } = body as JobSearchParams;

    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term required' }, { status: 400 });
    }

    const userId = 'demo-user';

    const creditBalance = await prisma.creditBalance.findUnique({ where: { userId } });
    if (!creditBalance || creditBalance.balance < CREDIT_COSTS.job_search) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const sites = (params.siteName || ['linkedin', 'indeed']) as SupportedSiteName[];

    const jobs = await scrapeJobs({
      siteName: sites,
      searchTerm,
      location: location || 'United States',
      resultsWanted: params.resultsWanted || 20,
      hoursOld: params.hoursOld || 168,
      countryIndeed: params.countryIndeed || 'USA',
      linkedinFetchDescription: true,
      ...params,
    });

    const jobMatches = jobs.map((job, index) => ({
      title: job.title || 'Unknown Title',
      company: job.company || 'Unknown Company',
      location: job.location || 'Unknown Location',
      url: job.jobUrl,
      source: job.site || 'unknown',
      description: job.description || '',
      matchedSkills: [],
      matchScore: Math.max(50, 100 - index * 2),
      remoteType: job.isRemote ? 'remote' : 'onsite',
    }));

    await prisma.creditBalance.update({
      where: { userId },
      data: { balance: { decrement: CREDIT_COSTS.job_search } },
    });

    await prisma.usageRecord.create({
      data: {
        userId,
        type: 'job_search',
        count: 1,
      },
    });

    return NextResponse.json({
      jobs: jobMatches,
      totalFound: jobMatches.length,
      creditsUsed: CREDIT_COSTS.job_search,
      creditsRemaining: creditBalance.balance - CREDIT_COSTS.job_search,
    });
  } catch (error) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Job search failed' },
      { status: 500 }
    );
  }
}