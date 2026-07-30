'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PlanGate } from '@/components/dashboard/PlanGate';
import { InterviewSetup } from '@/components/dashboard/interview/InterviewSetup';
import { InterviewSession } from '@/components/dashboard/interview/InterviewSession';
import { InterviewReport } from '@/components/dashboard/interview/InterviewReport';
import { useInterview } from '@/lib/hooks/useInterview';
import type { InterviewType, InterviewDifficulty } from '@/lib/types/interview';

type Step = 'setup' | 'interview' | 'report';

export default function InterviewsPage() {
  const [step, setStep] = useState<Step>('setup');
  const [sessionConfig, setSessionConfig] = useState<{
    resumeId: string;
    targetRole: string;
    interviewType: InterviewType;
    difficulty: InterviewDifficulty;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [firstQuestion, setFirstQuestion] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const { startInterview, loading, error } = useInterview();

  const handleStart = async (config: {
    resumeId: string;
    targetRole: string;
    interviewType: InterviewType;
    difficulty: InterviewDifficulty;
  }) => {
    try {
      const result = await startInterview(config);
      setSessionId(result.sessionId);
      setFirstQuestion(result.currentQuestion);
      setTotalQuestions(result.totalQuestions);
      setSessionConfig(config);
      setStep('interview');
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };

  const handleComplete = (completedSessionId: string) => {
    setSessionId(completedSessionId);
    setStep('report');
  };

  const handleDone = () => {
    setStep('setup');
    setSessionId(null);
    setSessionConfig(null);
    setFirstQuestion(null);
  };

  return (
    <DashboardLayout>
      <PlanGate requiredPlan="vip" featureName="AI Interviews" upgradeHref="/plans?plan=vip">
        {step === 'setup' && (
          <InterviewSetup onStart={handleStart} loading={loading} error={error} />
        )}
        {step === 'interview' && sessionId && firstQuestion && (
          <InterviewSession
            sessionId={sessionId}
            targetRole={sessionConfig?.targetRole || ''}
            totalQuestions={totalQuestions}
            firstQuestion={firstQuestion}
            onComplete={handleComplete}
          />
        )}
        {step === 'report' && sessionId && (
          <InterviewReport sessionId={sessionId} onDone={handleDone} />
        )}
      </PlanGate>
    </DashboardLayout>
  );
}
