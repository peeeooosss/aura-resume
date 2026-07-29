const APIFY_API_URL = 'https://api.apify.com/v2';
const APIFY_TOKEN = process.env.APIFY_TOKEN;

interface LinkedInProfile {
  url: string;
  headline?: string;
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills: string[];
  recommendations?: number;
  connections?: number;
  profilePhoto?: string;
}

async function runApifyActor(actorId: string, input: any): Promise<any> {
  const runResponse = await fetch(
    `${APIFY_API_URL}/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );

  if (!runResponse.ok) {
    const error = await runResponse.text();
    throw new Error(`Apify actor start failed: ${error}`);
  }

  const run = await runResponse.json();

  let status = run.data.status;
  while (status === 'RUNNING' || status === 'READY') {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const statusResponse = await fetch(
      `${APIFY_API_URL}/actor-runs/${run.data.id}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusResponse.json();
    status = statusData.data.status;
    if (status === 'SUCCEEDED') break;
    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED_OUT') {
      throw new Error(`Apify actor ${status.toLowerCase()}`);
    }
  }

  const datasetResponse = await fetch(
    `${APIFY_API_URL}/actor-runs/${run.data.id}/dataset/items?token=${APIFY_TOKEN}`
  );
  const dataset = await datasetResponse.json();

  return dataset.data;
}

export async function scrapeLinkedInProfile(linkedinUrl: string): Promise<LinkedInProfile> {
  const cleanUrl = linkedinUrl.includes('linkedin.com')
    ? linkedinUrl
    : `https://linkedin.com/in/${linkedinUrl}`;

  try {
    const results = await runApifyActor('harvestapi/linkedin-profile-scraper', {
      urls: [cleanUrl],
      proxyConfiguration: { useApifyProxy: true },
    });

    if (!results || results.length === 0) {
      throw new Error('No profile data returned from Apify');
    }

    const profile = results[0];

    return {
      url: cleanUrl,
      headline: profile.headline || '',
      summary: profile.about || profile.summary || '',
      experience: (profile.experience || []).map((exp: any) => ({
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || exp.current ? 'Present' : '',
        description: exp.description || '',
      })),
      skills: (profile.skills || []).map((s: any) => s.name || s),
      recommendations: profile.recommendationsCount || 0,
      connections: profile.connections || 0,
      profilePhoto: profile.profilePicture || '',
    };
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    throw new Error(`Failed to scrape LinkedIn profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function scrapeLinkedInCompany(companyUrl: string): Promise<any> {
  const cleanUrl = companyUrl.includes('linkedin.com')
    ? companyUrl
    : `https://linkedin.com/company/${companyUrl}`;

  try {
    const results = await runApifyActor('harvestapi/linkedin-company', {
      urls: [cleanUrl],
      proxyConfiguration: { useApifyProxy: true },
    });

    return results[0] || null;
  } catch (error) {
    console.error('LinkedIn company scraping error:', error);
    return null;
  }
}