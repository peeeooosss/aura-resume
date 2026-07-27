import { buildResumeAnalysisPrompt, buildLinkedInAnalysisPrompt, buildCoverLetterPrompt, buildJobMatchPrompt, buildRoadmapPrompt, RESUME_ANALYSIS_PROMPT, LINKEDIN_ANALYSIS_PROMPT, COVER_LETTER_PROMPT, ROADMAP_GENERATION_PROMPT, JOB_MATCH_ANALYSIS_PROMPT } from './prompts';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'json' | 'text';
  } = {}
): Promise<{ content: string; tokensUsed: number }> {
  const {
    model = 'anthropic/claude-3.5-sonnet',
    temperature = 0.3,
    maxTokens = 4000,
    responseFormat = 'json',
  } = options;

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'Aura Resume',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens || 0;

  return { content, tokensUsed };
}

export async function analyzeResume(resumeText: string): Promise<{
  score: number;
  strengths: string[];
  redFlags: string[];
  suggestions: string[];
  keywordGaps: string[];
  tokensUsed: number;
}> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: RESUME_ANALYSIS_PROMPT },
    { role: 'user', content: buildResumeAnalysisPrompt(resumeText) },
  ], { model: 'anthropic/claude-3.5-sonnet', temperature: 0.2 });

  try {
    const parsed = JSON.parse(content);
    return {
      score: parsed.score || 0,
      strengths: parsed.strengths || [],
      redFlags: parsed.redFlags || [],
      suggestions: parsed.suggestions || [],
      keywordGaps: parsed.keywordGaps || [],
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse resume analysis:', content);
    throw new Error('Invalid response format from AI');
  }
}

export async function analyzeLinkedIn(profileData: any): Promise<{
  score: number;
  strengths: string[];
  redFlags: string[];
  suggestions: string[];
  tokensUsed: number;
}> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: LINKEDIN_ANALYSIS_PROMPT },
    { role: 'user', content: buildLinkedInAnalysisPrompt(profileData) },
  ], { model: 'anthropic/claude-3.5-sonnet', temperature: 0.2 });

  try {
    const parsed = JSON.parse(content);
    return {
      score: parsed.score || 0,
      strengths: parsed.strengths || [],
      redFlags: parsed.redFlags || [],
      suggestions: parsed.suggestions || [],
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse LinkedIn analysis:', content);
    throw new Error('Invalid response format from AI');
  }
}

export async function generateCoverLetter(
  jobDescription: string,
  resumeText: string
): Promise<{
  coverLetter: string;
  matchHighlights: string[];
  suggestedSubjectLines: string[];
  tokensUsed: number;
}> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: COVER_LETTER_PROMPT },
    { role: 'user', content: buildCoverLetterPrompt(jobDescription, resumeText) },
  ], { model: 'anthropic/claude-3.5-sonnet', temperature: 0.5, maxTokens: 2000 });

  try {
    const parsed = JSON.parse(content);
    return {
      coverLetter: parsed.coverLetter || '',
      matchHighlights: parsed.matchHighlights || [],
      suggestedSubjectLines: parsed.suggestedSubjectLines || [],
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse cover letter:', content);
    throw new Error('Invalid response format from AI');
  }
}

export async function generateRoadmap(
  currentRole: string,
  goalRole: string,
  skills: string[]
): Promise<{
  title: string;
  goalRole: string;
  currentRole: string;
  timeline: {
    'week1-2': { focus: string; tasks: string[]; milestones: string[] };
    'week3-4': { focus: string; tasks: string[]; milestones: string[] };
    month2: { focus: string; tasks: string[]; milestones: string[] };
    month3: { focus: string; tasks: string[]; milestones: string[] };
  };
  skillsToLearn: string[];
  resources: { courses: string[]; books: string[]; projects: string[] };
  tokensUsed: number;
}> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: ROADMAP_GENERATION_PROMPT },
    { role: 'user', content: buildRoadmapPrompt(currentRole, goalRole, skills) },
  ], { model: 'anthropic/claude-3.5-sonnet', temperature: 0.4, maxTokens: 3000 });

  try {
    const parsed = JSON.parse(content);
    return { ...parsed, tokensUsed };
  } catch (e) {
    console.error('Failed to parse roadmap:', content);
    throw new Error('Invalid response format from AI');
  }
}

export async function analyzeJobMatch(
  jobDescription: string,
  resumeText: string
): Promise<{
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedExperience: string[];
  gaps: string[];
  recommendations: string[];
  matchReasoning: string;
  tokensUsed: number;
}> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: JOB_MATCH_ANALYSIS_PROMPT },
    { role: 'user', content: buildJobMatchPrompt(jobDescription, resumeText) },
  ], { model: 'anthropic/claude-3.5-sonnet', temperature: 0.2 });

  try {
    const parsed = JSON.parse(content);
    return { ...parsed, tokensUsed };
  } catch (e) {
    console.error('Failed to parse job match:', content);
    throw new Error('Invalid response format from AI');
  }
}