'use client';

import { useState } from 'react';
import { Check, X, RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PhaseQuizQuestion } from '@/lib/types/roadmap';

export function QuizSection({ quiz }: { quiz: PhaseQuizQuestion[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="text-center py-12 text-surface-400 dark:text-slate-500">
        <p>No quiz available for this phase yet.</p>
      </div>
    );
  }

  const question = quiz[currentQ];
  const selected = answers[currentQ];
  const isCorrect = selected === question.correctIndex;
  const score = submitted ? answers.filter((a, i) => a === quiz[i].correctIndex).length : 0;

  const handleSelect = (optIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers(new Array(quiz.length).fill(null));
    setSubmitted(false);
    setCurrentQ(0);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-surface-500 dark:text-slate-400 text-sm">
          Question {currentQ + 1} of {quiz.length}
        </p>
        {submitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <Trophy className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 font-semibold text-sm">{score}/{quiz.length}</span>
          </div>
        )}
      </div>

      <div className="h-2 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }}
        />
      </div>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
        <h4 className="text-surface-900 dark:text-white font-semibold mb-4">{question.question}</h4>
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && i === question.correctIndex;
            const showWrong = submitted && isSelected && !isCorrect;

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={submitted}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all text-sm',
                  showCorrect && 'border-emerald-500 bg-emerald-500/10',
                  showWrong && 'border-rose-500 bg-rose-500/10',
                  isSelected && !submitted && 'border-indigo-500 bg-indigo-500/10',
                  !isSelected && !showCorrect && !showWrong && 'border-surface-200 dark:border-slate-700 hover:border-surface-300 dark:hover:border-slate-600'
                )}
              >
                <span className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                  showCorrect && 'bg-emerald-500 text-white',
                  showWrong && 'bg-rose-500 text-white',
                  isSelected && !submitted && 'bg-indigo-500 text-white',
                  !isSelected && !showCorrect && !showWrong && 'bg-surface-100 dark:bg-slate-800 text-surface-500'
                )}>
                  {showCorrect ? <Check className="w-4 h-4" /> : showWrong ? <X className="w-4 h-4" /> : optionLabels[i]}
                </span>
                <span className="text-surface-700 dark:text-slate-300">{opt}</span>
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className={cn(
            'mt-4 p-4 rounded-xl text-sm',
            isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          )}>
            <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
            <p className="text-surface-600 dark:text-slate-300">{question.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white disabled:opacity-30 transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {quiz.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors',
                i === currentQ ? 'bg-indigo-500' :
                answers[i] !== null ? (answers[i] === quiz[i].correctIndex ? 'bg-emerald-500' : 'bg-rose-500') :
                'bg-surface-300 dark:bg-slate-700'
              )}
            />
          ))}
        </div>

        {currentQ < quiz.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Next
          </button>
        ) : !submitted ? (
          <button
            onClick={handleSubmit}
            disabled={answers.includes(null)}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-all"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
