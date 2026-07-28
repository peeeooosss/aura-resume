import { buildResumeAnalysisPrompt, buildLinkedInAnalysisPrompt, buildCoverLetterPrompt, buildJobMatchPrompt, buildRoadmapPrompt, buildJobRolePotentialPrompt, RESUME_ANALYSIS_PROMPT, LINKEDIN_ANALYSIS_PROMPT, COVER_LETTER_PROMPT, ROADMAP_GENERATION_PROMPT, JOB_MATCH_ANALYSIS_PROMPT, JOB_ROLE_POTENTIAL_PROMPT } from './prompts';
import type { JobRolePotential } from '@/lib/types';

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
    model = 'google/gemini-2.0-flash',
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
  }

  return trimmed;
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
  ], { model: 'anthropic/claude-opus-4.8', temperature: 0.2, maxTokens: 12000, expectJson: true });

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
  const systemPrompt = `You are Aura, the world's most advanced Applicant Tracking System (ATS) optimization AI and elite career strategist. Your sole purpose is to rewrite candidate resumes to achieve a 100/100 ATS score and pass manual recruiter screening at MAANG-tier companies.

You will receive the candidate's raw resume and an analysis of its ATS gaps. Whether the input is a sparse 50-word outline or a massive, multi-page document, your job is to clone the core facts and REWRITE them into a perfectly balanced ATS resume.

<rules>
  <rule>1. STRICT COMPLETENESS: You MUST include every section from the original resume. You are absolutely FORBIDDEN from skipping EDUCATION, SKILLS, or PROJECTS if they exist in the raw text.</rule>
  <rule>2. REWRITE, EXPAND, OR DISTILL: Do not simply copy the original text. 
    - If the input is extremely brief (e.g., 50 words), logically expand the responsibilities into high-impact, professional bullets based on the job title.
    - If the input is massive, distill it down to the most impactful points.
    - You must write exactly 4-6 bullet points per role/project.</rule>
  <rule>3. MANDATORY QUANTIFICATION: Every single bullet point MUST begin with a strong action verb and contain at least one hard metric (percentages, user counts, time saved, scale, or dollar amounts). If exact numbers aren't provided, logically infer a realistic, conservative scope based on context.</rule>
  <rule>4. TONE & STYLE: Absolutely no personal pronouns (I, me, my) and no passive voice. Keep the text hierarchy completely flat (no tables, columns, or nested lists).</rule>
  <rule>5. KEYWORDS: Seamlessly weave missing keywords from the analysis results into the Experience bullets and Summary. Never create a separate, out-of-context keyword block.</rule>
  <rule>6. IGNORE METADATA: Completely ignore any PDF parsing artifacts, page numbers, timestamps, or garbage text (e.g., "ATS Dot 2026"). Do not include them.</rule>
  <rule>7. OUTPUT FORMAT: Output ONLY the optimized resume in clean markdown. No explanations, no XML tags in your output, no pleasantries. Use ONLY standard headers in ALL CAPS: SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS.</rule>
  <rule>8. ABSOLUTELY NO TRUNCATION: You MUST output the ENTIRE resume — every section, every role, every bullet point — completely. Do not stop mid-section. Do not abbreviate. Do not use "..." or "[continued]". If your output reaches the maximum length, the system will automatically request a continuation — so do NOT self-limit. Every role and every project MUST have its full 4-6 complete bullet points. No exceptions.</rule>
</rules>

<important>
You have ample output capacity and the system handles multi-part output automatically. Do NOT worry about output length. The resume should be complete regardless of how long it becomes. Every section header listed in the template MUST appear in your output with complete content. If the original resume has 5+ roles, include all of them with full bullets. If the original resume has multiple projects, include all of them.
</important>

<markdown_output_template>
# [First Name] [Last Name]
[Email] | [Phone] | [LinkedIn URL] | [GitHub/Portfolio URL]

## SUMMARY
[A single, highly dense 3-4 sentence paragraph highlighting core expertise, years of experience, top technical skills, and a major career achievement. Must integrate missing keywords.]

## EXPERIENCE

### [Exact Job Title] | [Company Name] | [Month YYYY] – [Month YYYY or Present]
- [Action Verb] [Task/Project] using [Keywords/Tech], resulting in [Metric/Quantifiable Impact]
- [Action Verb] [Task/Project] using [Keywords/Tech], resulting in [Metric/Quantifiable Impact]
- [Action Verb] [Task/Project] using [Keywords/Tech], resulting in [Metric/Quantifiable Impact]
- [Action Verb] [Task/Project] using [Keywords/Tech], resulting in [Metric/Quantifiable Impact]

## EDUCATION

### [Degree Name] | [Institution Name] | [Start Year] – [End Year]
- [Optional: GPA, Honors, or relevant coursework]

## SKILLS
[Category 1] • [Category 2] • [Category 3] 
(Ensure skills are formatted as a bullet-separated inline list. NEVER omit this section if technical skills are present or implied.)

## PROJECTS

### [Project Name] | [Technologies Used] | [Month YYYY] - [Month YYYY]
- [Action Verb] [Task] resulting in [Metric]
- [Action Verb] [Task] resulting in [Metric]
- [Action Verb] [Task] resulting in [Metric]
- [Action Verb] [Task] resulting in [Metric]
</markdown_output_template>

<completion_checklist>
Before you finish, verify EVERY item:
▢ # [Full Name] header with contact info (email, phone, LinkedIn, GitHub/portfolio URLs from the original resume)
▢ ## SUMMARY section with 3-4 dense sentences containing keywords from the analysis
▢ ## EXPERIENCE section with EVERY role from the original resume, each with ### header and 4-6 quantified bullets
▢ ## EDUCATION section with degree details
▢ ## SKILLS section as bullet-separated inline list
▢ ## PROJECTS section with EVERY project from the original resume, each with ### header and 4-6 quantified bullets
▢ ## CERTIFICATIONS section if any exist in the original resume
Do NOT stop until EVERY checkbox above is filled.
</completion_checklist>

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
    model: 'anthropic/claude-opus-4.8',
    temperature: 0.1,
    maxTokens: 16000,
    expectJson: false,
  });

  if (!firstContent || firstContent.length < 100) {
    throw new Error('AI returned empty or too short response. Please try again.');
  }

  let finalContent = firstContent;
  let totalTokens = firstTokens;

  const requiredSections = ['## SUMMARY', '## EXPERIENCE', '## EDUCATION', '## SKILLS', '## PROJECTS'];

  if (finishReason === 'length') {
    for (let attempt = 0; attempt < 3; attempt++) {
      const lines = finalContent.split('\n').filter(l => l.trim());
      const lastHeaderMatch = [...lines].reverse().find(l => l.trim().match(/^## /));
      const lastSectionName = lastHeaderMatch ? lastHeaderMatch.trim() : 'the last section';

      const continueMessage = `CONTINUE FROM WHERE YOU STOPPED. You were in the middle of or just finished: ${lastSectionName}. Continue with the NEXT remaining content after "${lastSectionName}". Only output NEW content not yet written. Do NOT repeat any section headers or content already present above. Begin immediately with the next ## section or the remaining bullet points.`;

      const { content: contContent, tokensUsed: contTokens, finishReason: contReason } = await callOpenRouter([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
        { role: 'assistant', content: finalContent },
        { role: 'user', content: continueMessage },
      ], {
        model: 'anthropic/claude-opus-4.8',
        temperature: 0.1,
        maxTokens: 8000,
        expectJson: false,
      });

      if (contContent && contContent.length > 20) {
        const contLines = contContent.split('\n').map(l => l.trim()).filter(l => l);
        const firstContLine = contLines[0] || '';
        const lastFinalLine = finalContent.split('\n').filter(l => l.trim()).pop() || '';

        if (firstContLine === lastFinalLine) {
          contLines.shift();
        }
        let dedupedCont = contLines.join('\n');

        const h1Match = dedupedCont.match(/^# .+/);
        if (h1Match && finalContent.includes(h1Match[0])) {
          dedupedCont = dedupedCont.replace(/^# .+\n?/, '').trim();
        }

        finalContent = finalContent + '\n' + dedupedCont;
        totalTokens += contTokens;
      }

      if (contReason !== 'length') break;
    }
  }

  for (const section of requiredSections) {
    if (!finalContent.includes(section)) {
      const sectionName = section.replace('## ', '');
      const missingMessage = `The resume output is missing the ## ${sectionName} section. Generate ONLY this section now following the template format. Output the ## ${sectionName} header and its complete content only.`;

      const { content: missingContent, tokensUsed: missingTokens } = await callOpenRouter([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
        { role: 'assistant', content: finalContent },
        { role: 'user', content: missingMessage },
      ], {
        model: 'anthropic/claude-opus-4.8',
        temperature: 0.1,
        maxTokens: 4000,
        expectJson: false,
      });

      if (missingContent && missingContent.length > 20) {
        finalContent = finalContent + '\n\n' + missingContent.trim();
        totalTokens += missingTokens;
      }
    }
  }

  return { optimizedResume: finalContent, tokensUsed: totalTokens };
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
  ], { model: 'anthropic/claude-opus-4.8', temperature: 0.2, expectJson: true });

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
  ], { model: 'anthropic/claude-opus-4.8', temperature: 0.5, maxTokens: 2000, expectJson: true });

  try {
    const parsed = JSON.parse(content);
    return {
      coverLetter: parsed.coverLetter || '',
      matchHighlights: parsed.matchHighlights || [],
      suggestedSubjectLines: parsed.suggestedSubjectLines || [],
      tokensUsed,
    };
  } catch (e) {
    console.error('Failed to parse cover letter. Raw content:\n', content);
    throw new Error('AI returned invalid data. Please try again.');
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
  ], { model: 'anthropic/claude-opus-4.8', temperature: 0.4, maxTokens: 3000, expectJson: true });

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
  ], { model: 'anthropic/claude-opus-4.8', temperature: 0.2, expectJson: true });

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
  ], { model: 'anthropic/claude-opus-4.8', temperature: 0.2, expectJson: true });

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
