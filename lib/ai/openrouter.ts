import { buildResumeAnalysisPrompt, buildLinkedInAnalysisPrompt, buildCoverLetterPrompt, buildJobMatchPrompt, buildRoadmapPrompt, buildJobRolePotentialPrompt, RESUME_ANALYSIS_PROMPT, LINKEDIN_ANALYSIS_PROMPT, COVER_LETTER_PROMPT, ROADMAP_GENERATION_PROMPT, JOB_MATCH_ANALYSIS_PROMPT, JOB_ROLE_POTENTIAL_PROMPT, PERFECT_ATS_FIXER_PROMPT, buildFixerPrompt, ROADMAP_FROM_RESUME_PROMPT, buildRoadmapFromResumePrompt, INTERVIEW_QUESTIONS_PROMPT, INTERVIEW_EVALUATE_PROMPT, INTERVIEW_FINAL_REPORT_PROMPT, buildInterviewQuestionsPrompt, buildInterviewEvaluatePrompt, buildInterviewReportPrompt } from './prompts';
import type { JobRolePotential } from '@/lib/types';
import type { RoadmapGenerationResult } from '@/lib/types/roadmap';
import type { InterviewQuestion, InterviewScores, FinalReport } from '@/lib/types/interview';
import { repairRoadmapLinks } from './roadmapLinks';

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
    finish_reason?: string;
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
    expectJson?: boolean;
  } = {}
): Promise<{ content: string; tokensUsed: number; finishReason: string }> {
  const {
    model = 'google/gemini-2.5-flash-lite',
    temperature = 0.3,
    maxTokens = 4000,
    expectJson = false,
  } = options;

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3333',
      'X-Title': 'Aura Resume',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data: OpenRouterResponse = await response.json();
  let content = data.choices[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens || 0;
  const finishReason = data.choices[0]?.finish_reason || 'stop';

  if (expectJson && content) {
    content = extractJsonFromResponse(content);
  }

  return { content, tokensUsed, finishReason };
}

function extractJsonFromResponse(text: string): string {
  const trimmed = text.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {}
  }

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0]);
      return jsonMatch[0];
    } catch {}

    // Try to recover truncated JSON by closing unclosed structures
    const recovered = tryRecoverTruncatedJson(jsonMatch[0]);
    if (recovered) {
      return recovered;
    }
  }

  return trimmed;
}

function tryRecoverTruncatedJson(text: string): string | null {
  // Count unclosed braces and brackets
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;

  for (const char of text) {
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
  }

  // Close any unclosed strings, then close brackets and braces
  let recovered = text;
  if (inString) recovered += '"';
  while (brackets > 0) { recovered += ']'; brackets--; }
  while (braces > 0) { recovered += '}'; braces--; }

  try {
    JSON.parse(recovered);
    return recovered;
  } catch {
    return null;
  }
}

export async function analyzeResume(resumeText: string): Promise<{
  score: number;
  strengths: string[];
  redFlags: string[];
  suggestions: string[];
  keywordGaps: string[];
  jobRolePotential?: JobRolePotential;
  tokensUsed: number;
}> {
  const { content, tokensUsed, finishReason } = await callOpenRouter([
    { role: 'system', content: RESUME_ANALYSIS_PROMPT },
    { role: 'user', content: buildResumeAnalysisPrompt(resumeText) },
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.2, maxTokens: 12000, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return {
      score: parsed.score || 0,
      strengths: parsed.strengths || [],
      redFlags: parsed.redFlags || [],
      suggestions: parsed.suggestions || [],
      keywordGaps: parsed.keywordGaps || [],
      jobRolePotential: parsed.jobRolePotential,
      tokensUsed,
    };
  } catch (e) {
    if (finishReason === 'length') {
      console.error('Resume analysis truncated. Increasing tokens needed. Content snippet:\n', content.slice(-300));
    }
    console.error('Failed to parse resume analysis. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
  }
}

export async function generateATSPerfectResume(
  resumeText: string,
  analysis: any
): Promise<{
  optimizedResume: string;
  tokensUsed: number;
}> {
  const systemPrompt = `You are Aura, an elite ATS optimization AI. Your sole purpose is to rewrite candidate resumes to achieve a 100/100 ATS score.

You will receive the candidate's raw resume and an ATS gap analysis. You must clone the core facts and REWRITE them into a perfectly formatted ATS resume.

<rules>
  <rule>1. STRICT ORDER & NO DUPLICATES: You MUST output the sections in this EXACT order: SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS. You are absolutely FORBIDDEN from generating the same section twice. Once a section is written, move on.</rule>
  <rule>2. STRICT COMPLETENESS: You MUST include every section from the original resume. Never skip EDUCATION or SKILLS.</rule>
  <rule>3. CONTENT SCALING: Output exactly 4-6 bullet points per role/project. Expand brief inputs into high-impact bullets, and distill massive inputs down to the most impactful points.</rule>
  <rule>4. MANDATORY QUANTIFICATION: Every single bullet point MUST begin with a strong action verb and contain at least one hard metric (percentages, user counts, time saved). Logically infer conservative scope if exact numbers are missing.</rule>
  <rule>5. PARSER-STRICT FORMATTING: You MUST use exactly \`## \` for main sections and exactly \`### \` for role sub-headers. Never use bolding (\`**\`) for headers.</rule>
  <rule>6. OUTPUT FORMAT: Output ONLY the raw markdown. No explanations, no XML tags in your output, no conversational text.</rule>
</rules>

<markdown_output_template>
# [First Name] [Last Name]
[Email] | [Phone] | [LinkedIn URL] | [GitHub/Portfolio URL]

## SUMMARY
[3-4 sentence paragraph highlighting core expertise, years of experience, and top technical skills.]

## EXPERIENCE

### [Exact Job Title] | [Company Name] | [Month YYYY] – [Month YYYY or Present]
- [Action Verb] [Task/Project] using [Keywords], resulting in [Metric]

## EDUCATION

### [Degree Name] | [Institution Name] | [Start Year] – [End Year]
- [Optional: GPA, Honors, or relevant coursework]

## SKILLS
[Category 1] • [Category 2] • [Category 3] 

## PROJECTS

### [Project Name] | [Technologies Used] | [Month YYYY] - [Month YYYY]
- [Action Verb] [Task] resulting in [Metric]
</markdown_output_template>

PROCESS THE INPUT NOW. OUTPUT ONLY THE FINAL MARKDOWN FOLLOWING THE TEMPLATE ABOVE.`;

  const userMessage = `<analysis_results>
Score: ${analysis.score}/100

Red Flags:
${(analysis.redFlags || []).map((f: string) => `- ${f}`).join('\n') || '- None'}

Strengths:
${(analysis.strengths || []).map((s: string) => `- ${s}`).join('\n') || '- None'}

Suggestions:
${(analysis.suggestions || []).map((s: string) => `- ${s}`).join('\n') || '- None'}

Keyword Gaps:
${(analysis.keywordGaps || []).map((g: string) => `- ${g}`).join('\n') || '- None'}
</analysis_results>

<original_resume>
${resumeText}
</original_resume>`;

  const { content: firstContent, tokensUsed: firstTokens, finishReason } = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ], {
    temperature: 0.1,
    maxTokens: 24000,
    expectJson: false,
  });

  if (!firstContent || firstContent.length < 100) {
    throw new Error('AI returned empty or too short response. Please try again.');
  }

  let finalContent = firstContent;
  let totalTokens = firstTokens;

  const requiredSections = ['## SUMMARY', '## EXPERIENCE'];
  if (/education|university|college|institute|b\.?\s*tech|bachelor|master|degree|gpa|school/i.test(resumeText)) {
    requiredSections.push('## EDUCATION');
  }
  if (/skill|proficient|expertise|competenc|technolog|language|framework/i.test(resumeText)) {
    requiredSections.push('## SKILLS');
  }
  if (/project|portfolio|github|hackathon|built|developed|created|launched|deployed/i.test(resumeText)) {
    requiredSections.push('## PROJECTS');
  }
  if (/certif|course|credential|coursera|udemy|aws.*cert|comptia|license/i.test(resumeText)) {
    requiredSections.push('## CERTIFICATIONS');
  }

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  let currentFinishReason = finishReason;
  let retries = 0;

  while (currentFinishReason === 'length' && retries < 3) {
    const continuationMessage = {
      role: 'user' as const,
      content: 'CRITICAL: You hit the length limit. Output ONLY the continuation of the markdown from exactly where you left off. DO NOT start from the beginning. DO NOT repeat the header or any previous sections. Output ONLY the remaining text.',
    };

    messages.push({ role: 'assistant', content: finalContent });
    messages.push(continuationMessage);

    const { content: contContent, tokensUsed: contTokens, finishReason: contReason } = await callOpenRouter(messages, {
      temperature: 0.1,
      maxTokens: 8000,
      expectJson: false,
    });

    if (contContent && contContent.length > 20) {
      finalContent += '\n' + contContent;
      totalTokens += contTokens;
    }

    currentFinishReason = contReason;
    retries++;
  }

  const missingSections: string[] = [];
  if (!/##\s*EDUCATION/i.test(finalContent)) missingSections.push('EDUCATION');
  if (!/##\s*SKILLS/i.test(finalContent)) missingSections.push('SKILLS');
  if (!/##\s*PROJECTS/i.test(finalContent)) missingSections.push('PROJECTS');
  if (!/##\s*CERTIFICATIONS/i.test(finalContent)) missingSections.push('CERTIFICATIONS');

  if (missingSections.length > 0) {
    const fallbackMessage = {
      role: 'user' as const,
      content: `CRITICAL: You forgot to include these sections: ${missingSections.join(', ')}. Generate ONLY these specific missing sections in strict markdown format (using ## headers). DO NOT regenerate the entire resume. DO NOT include the Summary or Experience sections again. Output ONLY the missing sections.`,
    };

    messages.push(fallbackMessage);

    const { content: missingContent, tokensUsed: missingTokens } = await callOpenRouter(messages, {
      temperature: 0.1,
      maxTokens: 4000,
      expectJson: false,
    });

    if (missingContent && missingContent.length > 20) {
      finalContent += '\n\n' + missingContent.trim();
      totalTokens += missingTokens;
    }
  }

  return { optimizedResume: finalContent, tokensUsed: totalTokens };
}

export async function fixResumeToPerfectATS(
  resumeText: string,
  analysis: any
): Promise<{
  optimizedResume: string;
  tokensUsed: number;
}> {
  const { content: firstContent, tokensUsed: firstTokens, finishReason } = await callOpenRouter([
    { role: 'system', content: PERFECT_ATS_FIXER_PROMPT },
    { role: 'user', content: buildFixerPrompt(resumeText, analysis) },
  ], {
    temperature: 0.1,
    maxTokens: 24000,
    expectJson: false,
  });

  if (!firstContent || firstContent.length < 100) {
    throw new Error('AI returned empty or too short response. Please try again.');
  }

  let finalContent = firstContent;
  let totalTokens = firstTokens;

  const requiredSections = ['## SUMMARY', '## EXPERIENCE'];
  if (/education|university|college|institute|b\.?\s*tech|bachelor|master|degree|gpa|school/i.test(resumeText)) {
    requiredSections.push('## EDUCATION');
  }
  if (/skill|proficient|expertise|competenc|technolog|language|framework/i.test(resumeText)) {
    requiredSections.push('## SKILLS');
  }
  if (/project|portfolio|github|hackathon|built|developed|created|launched|deployed/i.test(resumeText)) {
    requiredSections.push('## PROJECTS');
  }
  if (/certif|course|credential|coursera|udemy|aws.*cert|comptia|license/i.test(resumeText)) {
    requiredSections.push('## CERTIFICATIONS');
  }

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: PERFECT_ATS_FIXER_PROMPT },
    { role: 'user', content: buildFixerPrompt(resumeText, analysis) },
  ];

  let currentFinishReason = finishReason;
  let retries = 0;

  while (currentFinishReason === 'length' && retries < 3) {
    const continuationMessage = {
      role: 'user' as const,
      content: 'CRITICAL: You hit the length limit. Output ONLY the continuation of the markdown from exactly where you left off. DO NOT start from the beginning. DO NOT repeat the header or any previous sections. Output ONLY the remaining text.',
    };

    messages.push({ role: 'assistant', content: finalContent });
    messages.push(continuationMessage);

    const { content: contContent, tokensUsed: contTokens, finishReason: contReason } = await callOpenRouter(messages, {
      temperature: 0.1,
      maxTokens: 8000,
      expectJson: false,
    });

    if (contContent && contContent.length > 20) {
      finalContent += '\n' + contContent;
      totalTokens += contTokens;
    }

    currentFinishReason = contReason;
    retries++;
  }

  const missingSections: string[] = [];
  if (!/##\s*EDUCATION/i.test(finalContent)) missingSections.push('EDUCATION');
  if (!/##\s*SKILLS/i.test(finalContent)) missingSections.push('SKILLS');
  if (!/##\s*PROJECTS/i.test(finalContent)) missingSections.push('PROJECTS');
  if (!/##\s*CERTIFICATIONS/i.test(finalContent)) missingSections.push('CERTIFICATIONS');

  if (missingSections.length > 0) {
    const fallbackMessage = {
      role: 'user' as const,
      content: `CRITICAL: You forgot to include these sections: ${missingSections.join(', ')}. Generate ONLY these specific missing sections in strict markdown format (using ## headers). DO NOT regenerate the entire resume. DO NOT include the Summary or Experience sections again. Output ONLY the missing sections.`,
    };

    messages.push(fallbackMessage);

    const { content: missingContent, tokensUsed: missingTokens } = await callOpenRouter(messages, {
      temperature: 0.1,
      maxTokens: 4000,
      expectJson: false,
    });

    if (missingContent && missingContent.length > 20) {
      finalContent += '\n\n' + missingContent.trim();
      totalTokens += missingTokens;
    }
  }

  return { optimizedResume: finalContent, tokensUsed: totalTokens };
}

export async function generateTailoredResumeForJob(
  resumeText: string,
  analysis: any,
  jobDescription: string,
  jobTitle: string,
  company: string
): Promise<{ optimizedResume: string; tokensUsed: number }> {
  const systemPrompt = `You are Aura, an elite ATS optimization AI. Your sole purpose is to tailor resumes for specific job descriptions to achieve maximum match scores.

You will receive the candidate's resume, an ATS gap analysis, and a target job description. You must REWRITE the resume to specifically target this job, matching its keywords, requirements, and culture.

<rules>
  <rule>1. JOB-FIRST TAILORING: Study the job description first. Identify every required skill, keyword, and qualification. Ensure the tailored resume addresses ALL of them.</rule>
  <rule>2. FILL THE GAPS: The analysis identifies gaps between the current resume and the job. Address every gap by rephrasing existing experience to highlight relevant work or by expanding bullet points to demonstrate equivalent skills.</rule>
  <rule>3. NO FABRICATION: Never invent experience the candidate does not have. Rephrase and reframe existing experience to match the job requirements — do not create fake roles or skills.</rule>
  <rule>4. STRICT FORMATTING: Use \`## \` for sections, \`### \` for role headers. Never bold headers. Output exactly 4-6 bullets per role with quantified metrics.</rule>
  <rule>5. OUTPUT ONLY the raw markdown resume. No explanations, no conversational text.</rule>
</rules>

<markdown_output_template>
# [First Name] [Last Name]
[Email] | [Phone] | [LinkedIn URL] | [GitHub/Portfolio URL]

## SUMMARY
[A 3-4 sentence paragraph explicitly targeting the ${jobTitle} role at ${company}. Must mirror keywords from the job description.]

## EXPERIENCE

### [Exact Job Title] | [Company Name] | [Month YYYY] – [Month YYYY or Present]
- [Action Verb] [Task] using [Job-Relevant Keywords], resulting in [Metric]

## EDUCATION

### [Degree Name] | [Institution Name] | [Start Year] – [End Year]
- [Optional: GPA, Honors, or relevant coursework]

## SKILLS
[Category 1: skills matching the job description] • [Category 2] • [Category 3]

## PROJECTS

### [Project Name] | [Technologies Used] | [Month YYYY] - [Month YYYY]
- [Action Verb] [Task] resulting in [Metric]
</markdown_output_template>

PROCESS THE INPUT NOW. OUTPUT ONLY THE TAILORED RESUME.`;

  const userMessage = `<analysis_results>
Score: ${analysis.score}/100

Red Flags:
${(analysis.redFlags || []).map((f: string) => `- ${f}`).join('\n') || '- None'}

Strengths:
${(analysis.strengths || []).map((s: string) => `- ${s}`).join('\n') || '- None'}

Keyword Gaps:
${(analysis.keywordGaps || []).map((g: string) => `- ${g}`).join('\n') || '- None'}
</analysis_results>

<target_job>
Title: ${jobTitle}
Company: ${company}
Description: ${jobDescription}
</target_job>

<original_resume>
${resumeText}
</original_resume>`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const { content: firstContent, tokensUsed: firstTokens, finishReason } = await callOpenRouter(messages, {
    temperature: 0.1,
    maxTokens: 24000,
    expectJson: false,
  });

  if (!firstContent || firstContent.length < 100) {
    throw new Error('AI returned empty or too short response. Please try again.');
  }

  let finalContent = firstContent;
  let totalTokens = firstTokens;
  let currentFinishReason = finishReason;
  let retries = 0;

  while (currentFinishReason === 'length' && retries < 3) {
    messages.push({ role: 'assistant', content: finalContent });
    messages.push({
      role: 'user',
      content: 'CRITICAL: You hit the length limit. Continue from exactly where you left off. DO NOT repeat any previous text. Output ONLY the remaining markdown.',
    });

    const { content: contContent, tokensUsed: contTokens, finishReason: contReason } = await callOpenRouter(messages, {
      temperature: 0.1,
      maxTokens: 8000,
      expectJson: false,
    });

    if (contContent && contContent.length > 20) {
      finalContent += '\n' + contContent;
      totalTokens += contTokens;
    }
    currentFinishReason = contReason;
    retries++;
  }

  return { optimizedResume: finalContent, tokensUsed: totalTokens };
}

export async function analyzeLinkedIn(profileData: any): Promise<{
  score: number;
  scoreBreakdown: Record<string, number>;
  strengths: string[];
  redFlags: string[];
  suggestions: string[];
  keywordGaps: string[];
  priorityActions: Array<{
    area: string;
    currentIssue: string;
    fixAction: string;
    exampleBefore: string;
    exampleAfter: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  tokensUsed: number;
}> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: LINKEDIN_ANALYSIS_PROMPT },
    { role: 'user', content: buildLinkedInAnalysisPrompt(profileData) },
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.2, maxTokens: 6000, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return {
      score: parsed.score || 0,
      scoreBreakdown: parsed.scoreBreakdown || {
        headline: 0,
        aboutSection: 0,
        experience: 0,
        skills: 0,
        network: 0,
        completeness: 0,
      },
      strengths: parsed.strengths || [],
      redFlags: parsed.redFlags || [],
      suggestions: parsed.suggestions || [],
      keywordGaps: parsed.keywordGaps || [],
      priorityActions: parsed.priorityActions || [],
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse LinkedIn analysis. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
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
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.5, maxTokens: 2000, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return {
      coverLetter: parsed.coverLetter || '',
      matchHighlights: parsed.matchHighlights || [],
      suggestedSubjectLines: parsed.suggestedSubjectLines || [],
      tokensUsed,
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'AI returned invalid data. Please try again or contact support.';
    console.error('Cover letter generation error:', message);
    throw new Error(message);
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
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.4, maxTokens: 3000, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return { ...parsed, tokensUsed };
  } catch (e) {
    console.error('Failed to parse roadmap. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
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
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.2, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return { ...parsed, tokensUsed };
  } catch (e) {
    console.error('Failed to parse job match. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
  }
}

export async function analyzeJobRolePotential(
  resumeText: string,
  analysis: any
): Promise<{
  jobRolePotential: JobRolePotential;
  tokensUsed: number;
}> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: JOB_ROLE_POTENTIAL_PROMPT },
    { role: 'user', content: buildJobRolePotentialPrompt(resumeText, analysis) },
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.2, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return {
      jobRolePotential: parsed,
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse job role potential. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
  }
}

export async function generateRoadmapFromResume(
  resumeText: string,
  analysis: any
): Promise<RoadmapGenerationResult> {
  const { content, tokensUsed, finishReason } = await callOpenRouter([
    { role: 'system', content: ROADMAP_FROM_RESUME_PROMPT },
    { role: 'user', content: buildRoadmapFromResumePrompt(resumeText, analysis) },
  ],   { model: 'google/gemini-2.5-pro', temperature: 0.4, maxTokens: 20000, expectJson: true });

  if (finishReason === 'length') {
    console.error('Roadmap generation truncated at', tokensUsed, 'tokens.');
  }

  try {
    const parsed = JSON.parse(content);
    const phases = (parsed.phases || []).map((phase: any) => ({
      ...phase,
      weeksData: (phase.weeksData || []).map((week: any) => ({
        ...week,
        isUnlocked: true,
        days: (week.days || []).map((day: any) => ({
          ...day,
          isCompleted: false,
        })),
      })),
      phaseContent: phase.phaseContent || { videos: [], quiz: [], projects: [], aiInterview: [] },
    }));

    const { roadmap: repairedRoadmap } = await repairRoadmapLinks({ ...parsed, phases });
    const repairedPhases = repairedRoadmap.phases || phases;

    return {
      recommendedRole: parsed.recommendedRole,
      currentStrengths: parsed.currentStrengths || [],
      criticalGaps: parsed.criticalGaps || [],
      phases: repairedPhases,
      totalTasks: repairedPhases.reduce((acc: number, phase: any) =>
        acc + (phase.weeksData?.reduce((wAcc: number, week: any) =>
          wAcc + (week.days?.length || 0), 0) || 0), 0) || 0,
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse roadmap. Raw content (first 500):\n', content.slice(0, 500));
    console.error('Raw content (last 500):\n', content.slice(-500));
    throw new Error('AI returned invalid data. Please try again.');
  }
}

export async function generateInterviewQuestions(
  resumeText: string,
  targetRole: string,
  interviewType: string,
  difficulty: string,
  count: number = 10
): Promise<{ questions: InterviewQuestion[]; tokensUsed: number }> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: INTERVIEW_QUESTIONS_PROMPT },
    { role: 'user', content: buildInterviewQuestionsPrompt(resumeText, targetRole, interviewType, difficulty, count) },
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.4, maxTokens: 8000, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return {
      questions: (parsed.questions || []).map((q: any) => ({
        question: q.question || '',
        category: q.category || 'technical',
        expectedPoints: q.expectedPoints || [],
        followUp: q.followUp || undefined,
      })),
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse interview questions. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
  }
}

export async function evaluateInterviewAnswer(
  question: string,
  expectedPoints: string[],
  answer: string,
  targetRole: string
): Promise<{ score: number; feedback: string; followUp: string | null; expectedPointsHit: string[]; expectedPointsMissed: string[]; tokensUsed: number }> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: INTERVIEW_EVALUATE_PROMPT },
    { role: 'user', content: buildInterviewEvaluatePrompt(question, expectedPoints, answer, targetRole) },
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.3, maxTokens: 2000, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return {
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      feedback: parsed.feedback || '',
      followUp: parsed.followUp || null,
      expectedPointsHit: parsed.expectedPointsHit || [],
      expectedPointsMissed: parsed.expectedPointsMissed || [],
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse answer evaluation. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
  }
}

export async function generateInterviewReport(
  questions: Array<{ question: string; answer: string; score: number; feedback: string }>,
  targetRole: string
): Promise<FinalReport> {
  const { content, tokensUsed } = await callOpenRouter([
    { role: 'system', content: INTERVIEW_FINAL_REPORT_PROMPT },
    { role: 'user', content: buildInterviewReportPrompt(questions, targetRole) },
  ], { model: 'google/gemini-2.5-flash-lite', temperature: 0.3, maxTokens: 4000, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return {
      overallScore: parsed.overallScore || 0,
      scores: {
        technical: parsed.scores?.technical || 0,
        communication: parsed.scores?.communication || 0,
        confidence: parsed.scores?.confidence || 0,
        completeness: parsed.scores?.completeness || 0,
      },
      summary: parsed.summary || '',
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      questionFeedback: questions.map((q, i) => ({
        question: q.question,
        score: q.score,
        feedback: q.feedback,
        answer: q.answer,
      })),
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse interview report. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
  }
}

export async function generateText(prompt: string): Promise<{ text: string; tokensUsed: number }> {
  const messages: OpenRouterMessage[] = [
    { role: 'system', content: 'You are an expert AI assistant. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ];

  const result = await callOpenRouter(messages, {
    temperature: 0.7,
    maxTokens: 2000,
    expectJson: true,
  });

  return { text: result.content, tokensUsed: result.tokensUsed };
}
