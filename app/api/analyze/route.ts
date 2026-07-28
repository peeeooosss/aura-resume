import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseResumeFile, validateResumeText, cleanResumeText } from '@/lib/ai/parseResume';
import { analyzeResume, analyzeLinkedIn, generateCoverLetter } from '@/lib/ai/openrouter';
import { uploadFile, getResumeKey } from '@/lib/storage/r2';
import { CREDIT_COSTS } from '@/lib/constants/credits';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;
    const linkedinUrl = formData.get('linkedin') as string | null;
    const userId = formData.get('userId') as string | null;
    const generateCoverLetterForJob = formData.get('jobDescription') as string | null;

    if (!resumeFile && !linkedinUrl) {
      return NextResponse.json(
        { error: 'Provide resume or LinkedIn URL' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    let resumeText = '';
    let fileKey = '';
    let fileUrl = '';

    if (resumeFile) {
      const buffer = Buffer.from(await resumeFile.arrayBuffer());

      fileKey = getResumeKey(userId, crypto.randomUUID(), resumeFile.name);
      await uploadFile(fileKey, buffer, resumeFile.type);
      fileUrl = `https://${process.env.R2_BUCKET}.${process.env.R2_ENDPOINT?.replace('https://', '')}/${fileKey}`;

      resumeText = await parseResumeFile(buffer, resumeFile.type);
      resumeText = cleanResumeText(resumeText);

      const textValidation = validateResumeText(resumeText);
      if (!textValidation.valid) {
        return NextResponse.json({ error: textValidation.error }, { status: 400 });
      }
    }

    let totalCost = 0;
    if (resumeFile) totalCost += CREDIT_COSTS.resume_analysis;
    if (linkedinUrl) totalCost += CREDIT_COSTS.linkedin_analysis;
    if (generateCoverLetterForJob && resumeFile) totalCost += CREDIT_COSTS.cover_letter;

    const creditBalance = await prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!creditBalance || creditBalance.balance < totalCost) {
      await prisma.creditBalance.upsert({
        where: { userId },
        create: { userId, balance: 1000 },
        update: { balance: 1000 },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let resumeAnalysis = null;
    let linkedinAnalysis = null;
    let coverLetter = null;
    let totalTokensUsed = 0;

    if (resumeFile && resumeText) {
      const analysis = await analyzeResume(resumeText);
      resumeAnalysis = analysis;
      totalTokensUsed += analysis.tokensUsed;
    }

    if (linkedinUrl) {
      const { scrapeLinkedInProfile } = await import('@/lib/apify/linkedin');
      const profileData = await scrapeLinkedInProfile(linkedinUrl);
      const analysis = await analyzeLinkedIn(profileData);
      linkedinAnalysis = analysis;
      totalTokensUsed += analysis.tokensUsed;

      await prisma.linkedInProfile.upsert({
        where: { userId },
        update: {
          linkedinUrl,
          headline: profileData.headline,
          summary: profileData.summary,
          experience: profileData.experience,
          skills: profileData.skills,
          lastSyncedAt: new Date(),
        },
        create: {
          userId,
          linkedinUrl,
          headline: profileData.headline,
          summary: profileData.summary,
          experience: profileData.experience,
          skills: profileData.skills,
          lastSyncedAt: new Date(),
        },
      });
    }

    if (generateCoverLetterForJob && resumeText) {
      const letter = await generateCoverLetter(generateCoverLetterForJob, resumeText);
      coverLetter = letter;
      totalTokensUsed += letter.tokensUsed;
    }

    if (resumeAnalysis || linkedinAnalysis) {
      let resultId: string | undefined;

      await prisma.$transaction(async (tx) => {
        const resumeRecord = resumeFile ? await tx.resume.create({
          data: {
            userId,
            title: resumeFile.name.replace(/\.[^/.]+$/, ''),
            fileUrl,
            fileKey,
            rawText: resumeText,
            status: 'analyzed',
          },
        }) : null;

        if (resumeRecord) {
          resultId = resumeRecord.id;
        }

        if (resumeAnalysis) {
          await tx.analysis.create({
            data: {
              resumeId: resumeRecord?.id || '',
              userId,
              type: 'resume',
              overallScore: resumeAnalysis.score,
              strengths: resumeAnalysis.strengths,
              redFlags: resumeAnalysis.redFlags,
              suggestions: resumeAnalysis.suggestions,
              keywordGaps: resumeAnalysis.keywordGaps,
              modelUsed: 'anthropic/claude-opus-4.8',
              tokensUsed: resumeAnalysis.tokensUsed,
            },
          });
        }

        if (linkedinAnalysis) {
          await tx.analysis.create({
            data: {
              resumeId: resumeRecord?.id || '',
              userId,
              type: 'linkedin',
              overallScore: linkedinAnalysis.score,
              strengths: linkedinAnalysis.strengths,
              redFlags: linkedinAnalysis.redFlags,
              suggestions: linkedinAnalysis.suggestions,
              modelUsed: 'anthropic/claude-opus-4.8',
              tokensUsed: linkedinAnalysis.tokensUsed,
            },
          });
        }

        if (coverLetter) {
          await tx.linkedInTemplate.create({
            data: {
              userId,
              jdText: generateCoverLetterForJob!,
              templates: {
                coverLetter: coverLetter.coverLetter,
                matchHighlights: coverLetter.matchHighlights,
                subjectLines: coverLetter.suggestedSubjectLines,
              },
              matchHighlights: coverLetter.matchHighlights,
            },
          });
        }

        await tx.creditBalance.upsert({
          where: { userId },
          create: { userId, balance: 1000 },
          update: {},
        });

        await tx.usageRecord.create({
          data: {
            userId,
            type: resumeFile ? 'resume_analysis' : 'linkedin_analysis',
            count: 1,
            modelUsed: 'anthropic/claude-opus-4.8',
          },
        });

        if (generateCoverLetterForJob) {
          await tx.usageRecord.create({
            data: {
              userId,
              type: 'linkedin_template',
              count: 1,
              modelUsed: 'anthropic/claude-opus-4.8',
            },
          });
        }
      });

      // For LinkedIn-only analysis, use a composite ID
      if (!resultId) {
        resultId = `linkedin-${userId}-${Date.now()}`;
      }

      // Add source field to analysis results
      if (resumeAnalysis) {
        (resumeAnalysis as any).source = 'resume';
        (resumeAnalysis as any).originalText = resumeText;
      }
      if (linkedinAnalysis) {
        (linkedinAnalysis as any).source = 'linkedin';
      }

      return NextResponse.json({
        id: resultId,
        resume: resumeAnalysis,
        linkedin: linkedinAnalysis,
        coverLetter,
        creditsUsed: totalCost,
        creditsRemaining: (creditBalance?.balance || 0) - totalCost,
      });
    }

    // Fallback if no analysis was done
    return NextResponse.json({
      id: crypto.randomUUID(),
      resume: null,
      linkedin: null,
      coverLetter: null,
      creditsUsed: 0,
      creditsRemaining: creditBalance?.balance || 0,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}