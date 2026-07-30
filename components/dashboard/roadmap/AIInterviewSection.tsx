'use client';

import { useState } from 'react';
import { Mic, Send, Bot, User, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PhaseAIInterview } from '@/lib/types/roadmap';

export function AIInterviewSection({ questions, isBlurred }: { questions: PhaseAIInterview[]; isBlurred?: boolean }) {
  const [activeQ, setActiveQ] = useState(0);
  const [showPoints, setShowPoints] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-surface-400 dark:text-slate-500">
        <Mic className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No interview questions available for this phase yet.</p>
      </div>
    );
  }

  const question = questions[activeQ];

  return (
    <div className="space-y-6">
      <p className="text-surface-500 dark:text-slate-400 text-sm">
        Practice answering these interview questions to prepare for your target role.
      </p>

      <div className="flex items-center gap-2 mb-4">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveQ(i); setShowPoints(false); }}
            className={cn(
              'w-8 h-8 rounded-lg text-xs font-bold transition-all',
              i === activeQ ? 'bg-indigo-600 text-white' :
              'bg-surface-100 dark:bg-slate-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-slate-700'
            )}
          >
            Q{i + 1}
          </button>
        ))}
      </div>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-surface-400 dark:text-slate-500 mb-1">Interviewer asks:</p>
            <p className="text-surface-900 dark:text-white font-semibold">{question.question}</p>
          </div>
        </div>

        <div className="bg-surface-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-surface-400 dark:text-slate-500 mb-2">Your answer (type or think through):</p>
              <div className="min-h-[80px] bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-700 rounded-lg p-3 text-sm text-surface-400 dark:text-slate-500 italic">
                Think about your response, then reveal the expected points below...
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPoints(!showPoints)}
          className="w-full flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm font-semibold hover:bg-indigo-500/20 transition-colors"
        >
          <span>{showPoints ? 'Hide' : 'Show'} Expected Talking Points</span>
          <ChevronRight className={cn('w-4 h-4 transition-transform', showPoints && 'rotate-90')} />
        </button>

        {showPoints && (
          <div className="mt-4 space-y-2 animate-fade-in">
            {question.expectedPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-surface-600 dark:text-slate-300 text-sm">{point}</p>
              </div>
            ))}

            {question.followUp && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-400 font-semibold mb-1">Follow-up question:</p>
                <p className="text-surface-600 dark:text-slate-300 text-sm">{question.followUp}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => { setActiveQ(Math.max(0, activeQ - 1)); setShowPoints(false); }}
          disabled={activeQ === 0}
          className="px-4 py-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white disabled:opacity-30 transition-colors"
        >
          Previous
        </button>
        <span className="text-surface-400 dark:text-slate-500 text-sm">{activeQ + 1} / {questions.length}</span>
        <button
          onClick={() => { setActiveQ(Math.min(questions.length - 1, activeQ + 1)); setShowPoints(false); }}
          disabled={activeQ === questions.length - 1}
          className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold disabled:opacity-30 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
