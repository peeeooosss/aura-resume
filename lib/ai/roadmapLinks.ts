interface CatalogVideo {
  title: string;
  id: string;
}

interface CatalogTopic {
  keywords: string[];
  videos: CatalogVideo[];
  articles: Array<{ title: string; url: string }>;
  platforms: Array<{ name: string; url: string }>;
}

export interface RepairStats {
  checked: number;
  kept: number;
  replaced: number;
  dropped: number;
}

const GENERAL_TOPIC: CatalogTopic = {
  keywords: [],
  videos: [{ title: 'STAR Method Interview: How to Answer Behavioral Questions', id: 'dRqN4BuhCHU' }],
  articles: [{ title: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web' }],
  platforms: [{ name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' }],
};

const TOPICS: CatalogTopic[] = [
  {
    keywords: ['html', 'css', 'tailwind', 'responsive design', 'flexbox', 'grid', 'sass', 'scss', 'web design'],
    videos: [
      { title: 'HTML Full Course - Build a Website Tutorial', id: 'pQN-pnXPaVg' },
      { title: 'CSS Tutorial - Zero to Hero (Complete Course)', id: '1Rs2ND1ryYc' },
      { title: 'Learn HTML - Full Tutorial for Beginners', id: 'kUMe1FH4CHE' },
    ],
    articles: [{ title: 'Learn web development - MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn' }],
    platforms: [{ name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' }],
  },
  {
    keywords: ['javascript', 'typescript', 'es6', 'dom'],
    videos: [
      { title: 'Learn JavaScript - Full Course for Beginners', id: 'PkZNo7MFNFg' },
      { title: 'JavaScript Programming - Full Course', id: 'jS4aFq5-91M' },
      { title: 'What the heck is the event loop anyway?', id: '8aGhZQkoFbQ' },
    ],
    articles: [{ title: 'JavaScript - MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }],
    platforms: [{ name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' }],
  },
  {
    keywords: ['typescript', 'ts', 'type safety'],
    videos: [{ title: 'Learn TypeScript - Full Course for Beginners', id: 'gp5H0Vw39yw' }],
    articles: [{ title: 'TypeScript Documentation', url: 'https://www.typescriptlang.org/docs/' }],
    platforms: [],
  },
  {
    keywords: ['react', 'reactjs', 'hooks', 'jsx', 'redux', 'next.js', 'nextjs'],
    videos: [
      { title: "React Course - Beginner's Tutorial for React JavaScript Library", id: 'bMknfKXIFA8' },
      { title: 'React Tutorial for Beginners', id: 'SqcY0GlETPk' },
      { title: 'React JS Crash Course', id: 'w7ejDZ8SWv8' },
    ],
    articles: [{ title: 'React - Learn', url: 'https://react.dev/learn' }],
    platforms: [{ name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' }],
  },
  {
    keywords: ['node', 'express', 'backend', 'server', 'api', 'rest', 'graphql', 'microservice'],
    videos: [
      { title: 'Node.js and Express.js - Full Course', id: 'Oe421EPjeBE' },
      { title: 'HTTP Crash Course & Exploration', id: 'iYM2zFP3Zn0' },
    ],
    articles: [{ title: 'Node.js Learn', url: 'https://nodejs.org/en/learn' }],
    platforms: [],
  },
  {
    keywords: ['django', 'flask', 'python web'],
    videos: [{ title: 'Django Tutorial for Beginners - Build Powerful Backends', id: 'rHux0gMZ3Eg' }],
    articles: [{ title: 'Django Documentation', url: 'https://docs.djangoproject.com/' }],
    platforms: [],
  },
  {
    keywords: ['sql', 'postgres', 'postgresql', 'mysql', 'database', 'nosql', 'mongodb', 'redis', 'query'],
    videos: [
      { title: 'SQL Tutorial - Full Database Course for Beginners', id: 'HXV3zeQKqGY' },
      { title: 'SQL Course for Beginners [Full Course]', id: '7S_tz1z_5bA' },
      { title: 'MongoDB Crash Course', id: 'ofme2o29ngU' },
    ],
    articles: [{ title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/' }],
    platforms: [{ name: 'StrataScratch', url: 'https://www.stratascratch.com' }],
  },
  {
    keywords: ['python', 'pandas', 'numpy', 'scripting'],
    videos: [
      { title: 'Learn Python - Full Course for Beginners', id: 'rfscVS0vtbw' },
      { title: 'Python Full Course for Beginners', id: '_uQrJ0TkZlc' },
    ],
    articles: [{ title: 'Python 3 Tutorial', url: 'https://docs.python.org/3/tutorial/' }],
    platforms: [],
  },
  {
    keywords: ['dsa', 'data structure', 'algorithm', 'leetcode', 'recursion', 'dynamic programming'],
    videos: [{ title: 'Data Structures and Algorithms in JavaScript - Full Course', id: 't2CEgPsws3U' }],
    articles: [{ title: 'GeeksforGeeks - Data Structures', url: 'https://www.geeksforgeeks.org/data-structures/' }],
    platforms: [
      { name: 'LeetCode', url: 'https://leetcode.com' },
      { name: 'HackerRank', url: 'https://www.hackerrank.com' },
      { name: 'CodeSignal', url: 'https://codesignal.com' },
    ],
  },
  {
    keywords: ['machine learning', 'ml', 'tensorflow', 'pytorch', 'nlp', 'deep learning', 'neural network', 'ai', 'model training', 'gan', 'generative', 'transformer', 'attention', 'llm', 'large language model', 'sagemaker', 'mlops', 'model deployment', 'distributed training', 'fine-tuning', 'fine tuning', 'gpt', 'diffusion'],
    videos: [
      { title: 'Machine Learning for Everybody - Full Course', id: 'i_LwzRVP7bg' },
      { title: 'Machine Learning Course for Beginners', id: 'NWONeJKn6kc' },
    ],
    articles: [{ title: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' }],
    platforms: [{ name: 'Kaggle', url: 'https://www.kaggle.com' }],
  },
  {
    keywords: ['data science', 'data analysis', 'analytics', 'statistics', 'data analyst', 'jupyter', 'visualization', 'data engineering', 'spark', 'data lake', 'data warehouse', 'etl', 'big data', 'pipeline'],
    videos: [{ title: 'Learn Data Science Tutorial - Full Course for Beginners', id: 'ua-CiDNNj30' }],
    articles: [{ title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn' }],
    platforms: [
      { name: 'Kaggle', url: 'https://www.kaggle.com' },
      { name: 'StrataScratch', url: 'https://www.stratascratch.com' },
    ],
  },
  {
    keywords: ['devops', 'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'cloud', 'ci/cd', 'jenkins', 'terraform', 'linux', 'ansible'],
    videos: [
      { title: 'Docker Tutorial for Beginners - A Full DevOps Course', id: 'fqMOX6JJhGo' },
      { title: 'Kubernetes Course - Full Beginners Tutorial', id: 'd6WC5n9G_sM' },
      { title: 'AWS Certified Cloud Practitioner Training', id: '3hLmDS179YE' },
      { title: 'The Complete Linux Course: Beginner to Power User', id: 'wBp0Rb-ZJak' },
    ],
    articles: [
      { title: 'Docker Docs - Get started', url: 'https://docs.docker.com/get-started/' },
      { title: 'Kubernetes Tutorials', url: 'https://kubernetes.io/docs/tutorials/' },
    ],
    platforms: [{ name: 'roadmap.sh', url: 'https://roadmap.sh' }],
  },
  {
    keywords: ['git', 'github', 'version control', 'gitlab'],
    videos: [{ title: 'Git and GitHub for Beginners - Crash Course', id: 'RGOj5yH7evk' }],
    articles: [{ title: 'Git Documentation', url: 'https://git-scm.com/doc' }],
    platforms: [{ name: 'GitHub', url: 'https://github.com' }],
  },
  {
    keywords: ['system design', 'architecture', 'scaling', 'load balancer', 'distributed', 'caching', 'database design', 'high level design', 'microservices architecture'],
    videos: [
      { title: 'System Design for Beginners Course', id: 'm8Icp_Cid5o' },
      { title: 'System Design Concepts Course and Interview Prep', id: 'F2FmTdLtb_4' },
    ],
    articles: [{ title: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' }],
    platforms: [],
  },
  {
    keywords: ['interview', 'behavioral', 'star', 'salary', 'negotiation', 'resume', 'mock interview', 'communication'],
    videos: [
      { title: 'STAR METHOD Interview Questions & Answers', id: 'OYNgoVxOVLk' },
      { title: 'STAR Method Interview: How to Answer Behavioral Questions', id: 'dRqN4BuhCHU' },
      { title: 'How to Ace Interviews Using the STAR Technique', id: 'PuZw3PEECIU' },
    ],
    articles: [{ title: 'Interview Preparation - InterviewBit', url: 'https://www.interviewbit.com/' }],
    platforms: [{ name: 'InterviewBit', url: 'https://www.interviewbit.com' }],
  },
];

const PLATFORM_CANONICAL: Record<string, string> = {
  leetcode: 'https://leetcode.com',
  hackerrank: 'https://www.hackerrank.com',
  codesignal: 'https://codesignal.com',
  github: 'https://github.com',
  freecodecamp: 'https://www.freecodecamp.org',
  'free code camp': 'https://www.freecodecamp.org',
  mdn: 'https://developer.mozilla.org',
  'mdn web docs': 'https://developer.mozilla.org',
  roadmap: 'https://roadmap.sh',
  'roadmap.sh': 'https://roadmap.sh',
  geeksforgeeks: 'https://www.geeksforgeeks.org',
  gfg: 'https://www.geeksforgeeks.org',
  stratascratch: 'https://www.stratascratch.com',
  kaggle: 'https://www.kaggle.com',
  coursera: 'https://www.coursera.org',
  udemy: 'https://www.udemy.com',
  codecademy: 'https://www.codecademy.com',
  codewars: 'https://www.codewars.com',
  youtube: 'https://www.youtube.com',
  pramp: 'https://www.pramp.com',
  interviewbit: 'https://www.interviewbit.com',
};

const youtubeCheckCache = new Map<string, Promise<boolean>>();
const urlCheckCache = new Map<string, Promise<boolean>>();

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isAcceptableStatus(status: number): boolean {
  return status === 401 || status === 403 || status === 429;
}

async function doVerifyYoutubeId(id: string): Promise<boolean> {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`
  )}&format=json`;
  try {
    const res = await fetchWithTimeout(url, { method: 'GET' }, 5000);
    return res.ok;
  } catch {
    return false;
  }
}

export function verifyYoutubeId(id: string): Promise<boolean> {
  const existing = youtubeCheckCache.get(id);
  if (existing) return existing;
  const pending = doVerifyYoutubeId(id);
  youtubeCheckCache.set(id, pending);
  return pending;
}

async function doVerifyHttpUrl(url: string): Promise<boolean> {
  try {
    const head = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'follow' }, 7000);
    if (head.ok || isAcceptableStatus(head.status)) return true;
    const get = await fetchWithTimeout(
      url,
      { method: 'GET', redirect: 'follow', headers: { Range: 'bytes=0-0' } },
      7000
    );
    return get.ok || isAcceptableStatus(get.status);
  } catch {
    return false;
  }
}

export function verifyHttpUrl(url: string): Promise<boolean> {
  const existing = urlCheckCache.get(url);
  if (existing) return existing;
  const pending = doVerifyHttpUrl(url);
  urlCheckCache.set(url, pending);
  return pending;
}

export function sanitizeUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/^["']|["']$/g, '');
  if (!trimmed) return null;
  if (/^https?:\/\/.+$/i.test(trimmed)) return trimmed;
  if (/^www\.[^\s]+$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function matchKeyword(text: string, keyword: string): boolean {
  const t = text.toLowerCase();
  const k = keyword.toLowerCase();
  if (k.length <= 3) return new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(t);
  return t.includes(k);
}

function matchTopic(text: string): CatalogTopic {
  const t = text || '';
  let best = GENERAL_TOPIC;
  let bestScore = 0;
  for (const topic of TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (matchKeyword(t, kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }
  return best;
}

async function pickVideo(text: string): Promise<CatalogVideo | null> {
  const topic = matchTopic(text);
  for (const video of topic.videos) {
    if (await verifyYoutubeId(video.id)) return video;
  }
  for (const video of GENERAL_TOPIC.videos) {
    if (await verifyYoutubeId(video.id)) return video;
  }
  return null;
}

function pickPlatform(name: string): string | null {
  const lower = name.toLowerCase().trim();
  const exact = PLATFORM_CANONICAL[lower];
  if (exact) return exact;
  for (const [key, url] of Object.entries(PLATFORM_CANONICAL)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

async function repairVideoEntry(video: any): Promise<{ title: string; url: string; description?: string } | null> {
  const url = sanitizeUrl(video?.url);
  if (!url) return null;
  const title = typeof video?.title === 'string' && video.title.trim() ? video.title.trim() : 'Watch on YouTube';
  const context = `${title} ${video?.description || ''}`;

  const id = extractYouTubeId(url);
  if (id) {
    if (await verifyYoutubeId(id)) {
      return { title, url: `https://www.youtube.com/watch?v=${id}`, description: video?.description };
    }
    const replacement = await pickVideo(context);
    if (replacement) {
      return { title: replacement.title, url: `https://www.youtube.com/watch?v=${replacement.id}`, description: video?.description };
    }
    return null;
  }

  if (await verifyHttpUrl(url)) {
    return { title, url, description: video?.description };
  }
  const replacement = await pickVideo(context);
  if (replacement) {
    return { title: replacement.title, url: `https://www.youtube.com/watch?v=${replacement.id}`, description: video?.description };
  }
  return null;
}

async function repairResourceEntry(resource: any): Promise<any | null> {
  const url = sanitizeUrl(resource?.url);
  if (!url) return null;
  const title = typeof resource?.title === 'string' && resource.title.trim() ? resource.title.trim() : 'Resource';
  const context = `${title} ${resource?.description || ''}`;

  const id = extractYouTubeId(url);
  if (id) {
    if (await verifyYoutubeId(id)) {
      return { ...resource, url: `https://www.youtube.com/watch?v=${id}` };
    }
    const replacement = await pickVideo(context);
    if (replacement) {
      return { ...resource, title: replacement.title, url: `https://www.youtube.com/watch?v=${replacement.id}` };
    }
    return null;
  }

  if (await verifyHttpUrl(url)) {
    return { ...resource, url };
  }

  const topic = matchTopic(context);
  for (const article of topic.articles) {
    if (await verifyHttpUrl(article.url)) {
      return { ...resource, title: article.title, url: article.url };
    }
  }
  return null;
}

async function repairPlatformEntry(platform: any): Promise<any | null> {
  const name = typeof platform?.name === 'string' && platform.name.trim() ? platform.name.trim() : '';
  const canonical = name ? pickPlatform(name) : null;
  if (canonical) {
    return { ...platform, name: name || 'Practice Platform', url: canonical };
  }
  const url = sanitizeUrl(platform?.url);
  if (url && (await verifyHttpUrl(url))) {
    return { ...platform, name: name || 'Practice Platform' };
  }
  return null;
}

export async function repairRoadmap(roadmap: any): Promise<{ roadmap: any; stats: RepairStats }> {
  const stats: RepairStats = { checked: 0, kept: 0, replaced: 0, dropped: 0 };
  const phases: any[] = Array.isArray(roadmap?.phases) ? roadmap.phases : [];
  const tasks: Array<Promise<void>> = [];

  const track = (originalUrl: unknown, repaired: any, dropped: boolean) => {
    if (dropped) {
      stats.dropped++;
    } else if (repaired?.url !== originalUrl) {
      stats.replaced++;
    } else {
      stats.kept++;
    }
  };

  for (const phase of phases) {
    for (const week of Array.isArray(phase?.weeksData) ? phase.weeksData : []) {
      for (const day of Array.isArray(week?.days) ? week.days : []) {
        if (!Array.isArray(day?.resources)) continue;
        tasks.push(
          (async () => {
            const out: any[] = [];
            for (const res of day.resources) {
              stats.checked++;
              const repaired = await repairResourceEntry(res);
              if (!repaired) {
                track(res?.url, null, true);
                continue;
              }
              track(res?.url, repaired, false);
              out.push(repaired);
            }
            day.resources = out;
          })()
        );
      }
    }

    const phaseContent = phase?.phaseContent;
    if (phaseContent) {
      if (Array.isArray(phaseContent.videos)) {
        tasks.push(
          (async () => {
            const out: any[] = [];
            for (const video of phaseContent.videos) {
              stats.checked++;
              const repaired = await repairVideoEntry(video);
              if (!repaired) {
                track(video?.url, null, true);
                continue;
              }
              track(video?.url, repaired, false);
              out.push(repaired);
            }
            phaseContent.videos = out;
          })()
        );
      }
      if (Array.isArray(phaseContent.researchResources)) {
        tasks.push(
          (async () => {
            const out: any[] = [];
            for (const resource of phaseContent.researchResources) {
              stats.checked++;
              const repaired = await repairResourceEntry(resource);
              if (!repaired) {
                track(resource?.url, null, true);
                continue;
              }
              track(resource?.url, repaired, false);
              out.push(repaired);
            }
            phaseContent.researchResources = out;
          })()
        );
      }
      if (Array.isArray(phaseContent.practicePlatforms)) {
        tasks.push(
          (async () => {
            const out: any[] = [];
            for (const platform of phaseContent.practicePlatforms) {
              stats.checked++;
              const repaired = await repairPlatformEntry(platform);
              if (!repaired) {
                track(platform?.url, null, true);
                continue;
              }
              track(platform?.url, repaired, false);
              out.push(repaired);
            }
            phaseContent.practicePlatforms = out;
          })()
        );
      }
    }
  }

  await Promise.all(tasks);

  const totalTasks = phases.reduce(
    (acc: number, phase: any) =>
      acc +
      (Array.isArray(phase?.weeksData)
        ? phase.weeksData.reduce((wAcc: number, week: any) => wAcc + (Array.isArray(week?.days) ? week.days.length : 0), 0)
        : 0),
    0
  );

  return { roadmap: { ...roadmap, phases, totalTasks }, stats };
}

export async function repairRoadmapLinks(roadmap: any): Promise<{ roadmap: any; stats: RepairStats }> {
  return repairRoadmap(roadmap);
}
