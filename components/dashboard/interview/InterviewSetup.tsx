'use client';

import { useState, useEffect } from 'react';
import { Mic, Zap, ArrowRight, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { InterviewType, InterviewDifficulty } from '@/lib/types/interview';
import { CREDIT_COSTS } from '@/lib/constants/credits';

interface Resume {
  id: string;
  title: string;
  rawText: string | null;
}

interface InterviewSetupProps {
  onStart: (config: {
    resumeId: string;
    targetRole: string;
    interviewType: InterviewType;
    difficulty: InterviewDifficulty;
  }) => void;
  loading?: boolean;
  error?: string | null;
}

const interviewTypes: { value: InterviewType; label: string; description: string }[] = [
  { value: 'technical', label: 'Technical', description: 'Focus on skills, system design, and coding concepts' },
  { value: 'behavioral', label: 'Behavioral', description: 'Focus on past experiences and soft skills' },
  { value: 'mixed', label: 'Mixed', description: 'Equal mix of technical and behavioral questions' },
];

const difficulties: { value: InterviewDifficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Foundational concepts, basic scenarios' },
  { value: 'medium', label: 'Medium', description: 'Applied knowledge, complex scenarios' },
  { value: 'hard', label: 'Hard', description: 'System design, trade-offs, edge cases' },
];

export function InterviewSetup({ onStart, loading, error }: InterviewSetupProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('medium');
  const [fetchingResumes, setFetchingResumes] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await fetch('/api/resumes');
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setFetchingResumes(false);
    }
  }

  const canStart = selectedResumeId && targetRole.trim().length >= 2 && !loading;

  function handleSubmit() {
    if (!canStart) return;
    onStart({
      resumeId: selectedResumeId,
      targetRole: targetRole.trim(),
      interviewType,
      difficulty,
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">AI Voice Interview</h2>
        <p className="text-surface-500 dark:text-slate-400">
          Practice with an AI interviewer using your voice. Get real-time feedback and scoring.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-2">
            Select Resume
          </label>
          {fetchingResumes ? (
            <div className="flex items-center gap-2 text-surface-400 dark:text-slate-500 text-sm py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading resumes...
            </div>
          ) : resumes.length === 0 ? (
            <p className="text-surface-400 dark:text-slate-500 text-sm py-3">
              No resumes found. Upload a resume first.
            </p>
          ) : (
            <div className="relative">
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full appearance-none bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              >
                <option value="">Choose a resume...</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-2">
            Target Role
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Senior Frontend Engineer, Product Manager, Data Scientist"
            className="w-full bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-3">
            Interview Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {interviewTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setInterviewType(type.value)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all',
                  interviewType === type.value
                    ? 'bg-indigo-500/10 border-indigo-500/30 ring-2 ring-indigo-500/20'
                    : 'bg-surface-100 dark:bg-slate-800/50 border-surface-300 dark:border-slate-700 hover:border-surface-400 dark:hover:border-slate-600'
                )}
              >
                <span className={cn(
                  'text-sm font-semibold block',
                  interviewType === type.value ? 'text-indigo-400' : 'text-surface-900 dark:text-white'
                )}>
                  {type.label}
                </span>
                <span className="text-xs text-surface-400 dark:text-slate-500 mt-0.5 block">
                  {type.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-3">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setDifficulty(diff.value)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all',
                  difficulty === diff.value
                    ? 'bg-indigo-500/10 border-indigo-500/30 ring-2 ring-indigo-500/20'
                    : 'bg-surface-100 dark:bg-slate-800/50 border-surface-300 dark:border-slate-700 hover:border-surface-400 dark:hover:border-slate-600'
                )}
              >
                <span className={cn(
                  'text-sm font-semibold block',
                  difficulty === diff.value ? 'text-indigo-400' : 'text-surface-900 dark:text-white'
                )}>
                  {diff.label}
                </span>
                <span className="text-xs text-surface-400 dark:text-slate-500 mt-0.5 block">
                  {diff.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canStart}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Start Interview
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-center text-surface-400 dark:text-slate-500 text-sm">
        10 questions • {CREDIT_COSTS.ai_interview} credits • Voice or text input
      </p>
    </div>
  );
}
