'use client';

import { useState, useCallback } from 'react';
import type { InterviewType, InterviewDifficulty, InterviewQuestion } from '@/lib/types/interview';

interface InterviewSessionData {
  id: string;
  targetRole: string;
  interviewType: string;
  difficulty: string;
  totalQuestions: number;
  firstQuestion: InterviewQuestion;
}

interface ActiveInterview {
  sessionId: string;
  targetRole: string;
  totalQuestions: number;
  currentQuestion: InterviewQuestion;
}

export function useInterview() {
  const [activeInterview, setActiveInterview] = useState<ActiveInterview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const startInterview = useCallback(async (config: {
    resumeId: string;
    targetRole: string;
    interviewType: InterviewType;
    difficulty: InterviewDifficulty;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.upgradeRequired) {
          throw new Error('AI Interviews require VIP plan. Upgrade to unlock.');
        }
        throw new Error(data.error || 'Failed to start interview');
      }

      const session: ActiveInterview = {
        sessionId: data.id,
        targetRole: data.targetRole,
        totalQuestions: data.totalQuestions,
        currentQuestion: data.firstQuestion,
      };

      setActiveInterview(session);
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start interview';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeInterview = useCallback(() => {
    setActiveInterview(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    activeInterview,
    loading,
    error,
    history,
    startInterview,
    completeInterview,
    clearError,
  };
}
