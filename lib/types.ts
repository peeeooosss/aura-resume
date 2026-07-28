export interface JobRolePotential {
  potentialRoles: Array<{
    title: string;
    matchScore: number;
    company: string;
    salaryRange: string;
    requiredSkills: string[];
  }>;
  skillsGap: Array<{
    skill: string;
    importance: 'high' | 'medium' | 'low';
    currentLevel: string;
    targetLevel: string;
  }>;
  salaryRange: {
    minimum: string;
    maximum: string;
    average: string;
  };
  matchReasoning: string;
}

export interface SingleAnalysis {
  source: 'resume' | 'linkedin';
  score: number;
  strengths: string[];
  redFlags: string[];
  overlappingFlags?: string[];
  suggestions?: string[];
  keywordGaps?: string[];
  jobRolePotential?: JobRolePotential;
  originalText?: string;
}

export interface DualAnalysisResult {
  id: string;
  resume?: SingleAnalysis;
  linkedin?: SingleAnalysis;
  coverLetter?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  createdAt: string;
  unlockedTier?: string;
  optimizedResumeText?: string;
  purchasedAt?: string;
}
