import { scrapeJobs, ScrapeJobsOptions, SupportedSiteName, JobData } from 'ts-jobspy';

export interface JobSearchParams {
  searchTerm: string;
  location?: string;
  siteName?: SupportedSiteName[];
  resultsWanted?: number;
  hoursOld?: number;
  countryIndeed?: string;
  isRemote?: boolean;
  jobType?: string;
}

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  url: string;
  description: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore?: number;
  matchReasoning: string;
  remoteType?: string;
  postedDate?: string;
  source: string;
}

export async function searchJobs(params: JobSearchParams): Promise<JobResult[]> {
  const options: ScrapeJobsOptions = {
    siteName: params.siteName || ['linkedin', 'indeed'],
    searchTerm: params.searchTerm,
    location: params.location || 'India',
    resultsWanted: params.resultsWanted || 20,
    hoursOld: params.hoursOld || 48,
    countryIndeed: params.countryIndeed || 'India',
    isRemote: params.isRemote,
    jobType: params.jobType,
    linkedinFetchDescription: true,
  };

  try {
    const jobs = await scrapeJobs(options);

    return jobs.map((job: JobData, index: number) => ({
      id: job.id || `job-${Date.now()}-${index}`,
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      salaryMin: job.minAmount ?? undefined,
      salaryMax: job.maxAmount ?? undefined,
      salaryCurrency: job.currency || 'INR',
      url: job.jobUrl || '',
      description: job.description || '',
      matchedSkills: [],
      missingSkills: [],
      matchScore: 0,
      matchReasoning: '',
      remoteType: job.isRemote ? 'remote' : undefined,
      postedDate: job.datePosted || undefined,
      source: job.site || 'unknown',
    }));
  } catch (error) {
    console.error('Job search error:', error);
    throw new Error(`Job search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function searchJobsByMultipleTerms(
  searchTerms: string[],
  location: string,
  options: Partial<JobSearchParams> = {}
): Promise<JobResult[]> {
  const allJobs: JobResult[] = [];

  for (const term of searchTerms) {
    try {
      const jobs = await searchJobs({ ...options, searchTerm: term, location });
      allJobs.push(...jobs);
    } catch (error) {
      console.error(`Search failed for term: ${term}`, error);
    }
  }

  const uniqueJobs = allJobs.filter(
    (job, index, self) => index === self.findIndex((j) => j.url === job.url)
  );

  return uniqueJobs;
}