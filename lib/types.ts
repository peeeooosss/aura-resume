export interface SingleAnalysis {
  source: 'resume' | 'linkedin';
  score: number;
  strengths: string[];
  redFlags: string[];
  overlappingFlags?: string[];
}

export interface DualAnalysisResult {
  id: string;
  resume?: SingleAnalysis;
  linkedin?: SingleAnalysis;
  createdAt: string;
}
