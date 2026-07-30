export type TaskType = 'LEARN' | 'BUILD' | 'NETWORK' | 'APPLY' | 'INTERVIEW_PREP';

export interface RoadmapDay {
  day: number;
  title: string;
  description: string;
  duration: number;
  type: TaskType;
  isCompleted: boolean;
  completedAt?: string;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  days: RoadmapDay[];
  isUnlocked: boolean;
}

export interface PhaseVideo {
  title: string;
  url: string;
  description: string;
}

export interface PhaseQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PhaseProject {
  name: string;
  description: string;
  techStack: string[];
  deliverables: string[];
  steps: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PhaseAIInterview {
  question: string;
  expectedPoints: string[];
  followUp?: string;
}

export interface PhaseContent {
  videos: PhaseVideo[];
  quiz: PhaseQuizQuestion[];
  projects: PhaseProject[];
  aiInterview: PhaseAIInterview[];
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  weeks: string;
  theme: string;
  weeksData: RoadmapWeek[];
  milestone: {
    title: string;
    description: string;
    reward?: string;
  };
  phaseContent?: PhaseContent;
}

export interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  timeToLearn: string;
}

export interface RoadmapData {
  id: string;
  userId: string;
  resumeId: string;
  title: string;
  goalRole: string;
  currentRole?: string;
  overview?: string;
  currentStrengths: string[];
  criticalGaps: SkillGap[];
  phases: RoadmapPhase[];
  currentPhase: number;
  currentWeek: number;
  currentDay: number;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapListItem {
  id: string;
  resumeId: string;
  title: string;
  goalRole: string;
  progress: number;
  currentPhase: number;
  totalTasks: number;
  completedTasks: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface RecommendedRole {
  title: string;
  matchScore: number;
  reasoning: string;
  salaryRange: string;
  timeToReady: string;
}

export interface RoadmapGenerationResult {
  recommendedRole: RecommendedRole;
  currentStrengths: string[];
  criticalGaps: SkillGap[];
  phases: RoadmapPhase[];
  totalTasks: number;
  tokensUsed: number;
}
