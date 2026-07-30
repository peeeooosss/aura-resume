export type InterviewType = 'technical' | 'behavioral' | 'mixed';
export type InterviewDifficulty = 'easy' | 'medium' | 'hard';
export type InterviewStatus = 'active' | 'completed' | 'abandoned';

export interface InterviewQuestion {
  question: string;
  category: string;
  expectedPoints: string[];
  followUp?: string;
  answer?: string;
  score?: number;
  feedback?: string;
  timeSpent?: number;
}

export interface InterviewScores {
  technical: number;
  communication: number;
  confidence: number;
  completeness: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  resumeId: string;
  targetRole: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  status: InterviewStatus;
  questions: InterviewQuestion[];
  currentQ: number;
  totalQuestions: number;
  overallScore: number | null;
  scores: InterviewScores | null;
  feedback: Record<string, string> | null;
  summary: string | null;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
}

export interface InterviewSetupConfig {
  resumeId: string;
  targetRole: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  followUp: string | null;
  expectedPointsHit: string[];
  expectedPointsMissed: string[];
}

export interface FinalReport {
  overallScore: number;
  scores: InterviewScores;
  summary: string;
  questionFeedback: Array<{
    question: string;
    score: number;
    feedback: string;
    answer: string;
  }>;
  strengths: string[];
  improvements: string[];
  tokensUsed: number;
}
