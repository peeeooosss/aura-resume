export interface SingleAnalysis {
  source: 'resume' | 'linkedin';
  score: number;
  strengths: string[];
  redFlags: string[];
  overlappingFlags?: string[];
  suggestions?: string[];
  keywordGaps?: string[];
}

export interface DualAnalysisResult {
  id: string;
  resume?: SingleAnalysis;
  linkedin?: SingleAnalysis;
  coverLetter?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  createdAt: string;
}
