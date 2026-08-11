'use client';

import { useState } from 'react';
import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { ROADMAP_TASK_TYPES } from '@/lib/constants/roadmap';
import { useParams } from 'next/navigation';
import {
  Map, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, Lock,
  Loader2, ArrowLeft, Play, Brain, Folder, Mic, ListTodo, BookOpen,
  MousePointerClick, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { VideoSection } from './VideoSection';
import { QuizSection } from './QuizSection';
import { ProjectSection } from './ProjectSection';
import { AIInterviewSection } from './AIInterviewSection';
import { ResearchSection } from './ResearchSection';
import { PracticePlatformSection } from './PracticePlatformSection';
import type { PhaseContent } from '@/lib/types/roadmap';

const PHASE_CONTENT_TABS = [
  { icon: ListTodo, label: 'Tasks', key: 'tasks' },
  { icon: Play, label: 'Videos', key: 'videos' },
  { icon: BookOpen, label: 'Research', key: 'research' },
  { icon: MousePointerClick, label: 'Practice', key: 'practice' },
  { icon: Brain, label: 'Quiz', key: 'quiz' },
  { icon: Folder, label: 'Projects', key: 'projects' },
  { icon: Mic, label: 'AI Interview', key: 'interview' },
] as const;

const PHASE_COLORS = [
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-pink-500',
];

const PHASE_GRADIENT_BG = [
  'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  'bg-amber-500/10 border-amber-500/20 text-amber-400',
];

export function RoadmapDetail() {
  const params = useParams();
  const roadmapId = params.id as string;
  const {
    currentRoadmap,
    loading,
    completeTask,
    getPhaseProgress,
    isPhaseUnlocked,
  } = useRoadmap(roadmapId);

  const [openPhase, setOpenPhase] = useState<number>(1);
  const [activePhaseContentTab, setActivePhaseContentTab] = useState<Record<number, string>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!currentRoadmap) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16">
        <Map className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Roadmap Not Found</h2>
        <p className="text-surface-500 dark:text-slate-400">
          This roadmap doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

      const phases = (currentRoadmap.phases as any[]) || [];

  if (phases.length === 0) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16">
        <Map className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">No Phases Yet</h2>
        <p className="text-surface-500 dark:text-slate-400">
          Phase data is still generating. Please check back shortly.
        </p>
      </div>
    );
  }

  const handleCompleteTask = async (dayNumber: number, taskId: string) => {
    setCompletingTask(taskId);
    try {
      await completeTask(roadmapId, dayNumber, taskId);
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompletingTask(null);
    }
  };

  const phaseProgress = (phase: any) => getPhaseProgress(phase);
  const currentPhaseData = phases.find((p: any) => p.phase === openPhase) || phases[0];

  const phaseContent: PhaseContent | null = currentPhaseData?.phaseContent || null;
  const phaseProgressData = currentPhaseData ? phaseProgress(currentPhaseData) : { total: 0, completed: 0, percentage: 0 };

  const activeTabContentKey = (phaseNum: number) =>
    activePhaseContentTab[phaseNum] || 'tasks';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roadmaps
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Map className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
            {currentRoadmap.goalRole}
          </h1>
        </div>
        <p className="text-surface-500 dark:text-slate-400 mb-1 line-clamp-2">
          {currentRoadmap.overview}
        </p>
        {currentRoadmap.currentPhase && (
          <p className="text-sm text-surface-400 dark:text-slate-500">
            Phase {currentRoadmap.currentPhase}/3 · Week {currentRoadmap.currentWeek}/12
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          {/* Phase dropdowns */}
          {phases.map((phase: any, idx: number) => {
            const color = PHASE_COLORS[idx % PHASE_COLORS.length];
            const badge = PHASE_GRADIENT_BG[idx % PHASE_GRADIENT_BG.length];
            const isOpen = openPhase === phase.phase;
                    const unlocked = isPhaseUnlocked(currentRoadmap, phase.phase);
            const progress = phaseProgress(phase);

            return (
              <div
                key={phase.phase}
                className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => {
                    if (unlocked) {
                      setOpenPhase(phase.phase);
                      if (!activePhaseContentTab[phase.phase]) {
                        setActivePhaseContentTab({ ...activePhaseContentTab, [phase.phase]: 'tasks' });
                      }
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between p-5 text-left transition-colors',
                    unlocked ? 'hover:bg-surface-50 dark:hover:bg-slate-800/50' : 'cursor-default opacity-70',
                  )}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0',
                        badge,
                      )}
                    >
                      <span className="font-bold text-sm">Month {phase.phase}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                        {phase.title}
                        {!unlocked && <Lock className="w-4 h-4 text-surface-400 dark:text-slate-500" />}
                      </h3>
                      <p className="text-surface-400 dark:text-slate-400 text-sm">
                        {phase.weeks} · {phase.theme}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-surface-500 dark:text-slate-400">
                      {progress.completed}/{progress.total} days
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-surface-400 dark:text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-surface-400 dark:text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Phase progress bar */}
                <div className="px-5 pb-2">
                  <div className="h-2 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full bg-gradient-to-r rounded-full transition-all', color)}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5">
                    {phase.motivationalText && (
                      <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <Sparkles className="w-4 h-4 text-indigo-400 inline mr-1" />
                        <p className="text-indigo-300 dark:text-indigo-300 text-sm italic">
                          {phase.motivationalText}
                        </p>
                      </div>
                    )}

                    {/* Sub-tabs */}
                    <div className="flex border-b border-surface-200 dark:border-slate-800 overflow-x-auto mb-4">
                      {PHASE_CONTENT_TABS.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() =>
                            setActivePhaseContentTab((prev) => ({ ...prev, [phase.phase]: tab.key }))
                          }
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap',
                            activeTabContentKey(phase.phase) === tab.key
                              ? 'border-indigo-500 text-indigo-400'
                              : 'border-transparent text-surface-400 dark:text-slate-500 hover:text-surface-600 dark:hover:text-slate-300',
                          )}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <div className="pt-2">
                      {(() => {
                        const tab = activeTabContentKey(phase.phase);
                        const content: PhaseContent | null = phase.phaseContent || null;

                        switch (tab) {
                          case 'tasks':
                            return renderTasks(phase);
                          case 'videos':
                            return <VideoSection videos={content?.videos || []} />;
                          case 'research':
                            return <ResearchSection resources={content?.researchResources || []} />;
                          case 'practice':
                            return <PracticePlatformSection platforms={content?.practicePlatforms || []} />;
                          case 'quiz':
                            return <QuizSection quiz={content?.quiz || []} />;
                          case 'projects':
                            return <ProjectSection projects={content?.projects || []} />;
                          case 'interview':
                            return <AIInterviewSection questions={content?.aiInterview || []} />;
                          default:
                            return null;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6 xl:col-span-4">
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <Map className="w-4 h-4 text-indigo-400" />
              Your Strengths
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentRoadmap.currentStrengths?.map((strength: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Critical Gaps</h3>
            <div className="space-y-2.5">
              {currentRoadmap.criticalGaps?.map((gap: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-50 dark:bg-slate-800/50 rounded-xl border border-surface-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-surface-900 dark:text-white text-xs">{gap.skill}</p>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-semibold rounded-full',
                        gap.importance === 'high'
                          ? 'bg-rose-500/10 text-rose-400'
                          : gap.importance === 'medium'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-surface-200 dark:bg-slate-700 text-surface-500 dark:text-slate-400',
                      )}
                    >
                      {gap.importance}
                    </span>
                  </div>
                  <p className="text-surface-400 dark:text-slate-500 text-[11px]">{gap.timeToLearn}</p>
                </div>
              ))}
            </div>
          </div>

          {currentPhaseData?.milestone && (
            <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-2">Month Milestone</h3>
              <div
                className={cn(
                  'p-3 rounded-xl border',
                  PHASE_GRADIENT_BG[(openPhase - 1) % PHASE_GRADIENT_BG.length],
                )}
              >
                <p className="font-medium text-sm">{currentPhaseData.milestone.title}</p>
                <p className="text-surface-500 dark:text-slate-400 text-xs mt-1">
                  {currentPhaseData.milestone.description}
                </p>
                {currentPhaseData.milestone.reward && (
                  <p className="text-surface-400 dark:text-slate-500 text-xs mt-1 italic">
                    Reward: {currentPhaseData.milestone.reward}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderTasks(phase: any) {
    const weeksData = phase.weeksData || [];
    if (!weeksData || weeksData.length === 0) {
      return (
        <div className="text-center py-12 text-surface-400 dark:text-slate-500">
          <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No tasks available for this month yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-surface-500 dark:text-slate-400 text-sm mb-3">
          Week-by-week daily tasks for Month {phase.phase}.
        </p>
        {weeksData.map((week: any) => (
          <div
            key={week.week}
            className={cn(
              'rounded-xl border transition-all',
              week.isUnlocked
                ? 'border-surface-300 dark:border-slate-700'
                : 'border-surface-200 dark:border-slate-800 opacity-60',
            )}
          >
            <div className="p-3.5 border-b border-surface-200 dark:border-slate-800 flex items-center justify-between">
              <h4 className="font-medium text-surface-900 dark:text-white text-sm">
                Week {week.week} — {week.title}
              </h4>
              {!week.isUnlocked && <Lock className="w-4 h-4 text-surface-400 dark:text-slate-500" />}
            </div>

            {week.isUnlocked && (
              <div className="divide-y divide-surface-200 dark:divide-slate-800">
                {week.days.map((day: any) => {
                  const taskType = ROADMAP_TASK_TYPES[day.type as keyof typeof ROADMAP_TASK_TYPES];
                  return (
                    <div key={day.day} className="p-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCompleteTask(day.day, `day-${day.day}`)}
                          disabled={completingTask === `day-${day.day}`}
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                            day.isCompleted
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-400 dark:border-slate-600 hover:border-indigo-500',
                          )}
                        >
                          {completingTask === `day-${day.day}` ? (
                            <Loader2 className="w-3 h-3 text-white animate-spin" />
                          ) : day.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          ) : null}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'font-medium text-sm',
                              day.isCompleted
                                ? 'text-surface-500 dark:text-slate-400 line-through'
                                : 'text-surface-900 dark:text-white',
                            )}
                          >
                            Day {day.day}: {day.title}
                          </p>
                          <p className="text-surface-400 dark:text-slate-500 text-xs">
                            {day.duration} min
                          </p>
                        </div>

                        {taskType ? (
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              taskType.bgColor,
                              taskType.color,
                            )}
                          >
                            {taskType.icon} {taskType.label}
                          </span>
                        ) : null}

                        <button
                          onClick={() =>
                            setExpandedTask(
                              expandedTask === `day-${day.day}` ? null : `day-${day.day}`,
                            )
                          }
                          className="p-1 hover:bg-surface-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          {expandedTask === `day-${day.day}` ? (
                            <ChevronUp className="w-4 h-4 text-surface-400 dark:text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-surface-400 dark:text-slate-500" />
                          )}
                        </button>
                      </div>

                      {expandedTask === `day-${day.day}` && (
                        <div className="px-3 pb-2 border-t border-surface-200 dark:border-slate-700">
                          <p className="text-surface-600 dark:text-slate-300 text-sm mt-2">
                            {day.description}
                          </p>
                          {day.resources && day.resources.length > 0 && (
                            <div className="mt-3">
                              <p className="text-surface-500 dark:text-slate-400 text-xs font-medium mb-2">
                                Resources
                              </p>
                              {day.resources.map((resource: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-surface-100 dark:bg-slate-800/50 rounded-lg hover:bg-surface-200 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <span className="text-sm text-surface-600 dark:text-slate-300">
                                    {resource.title}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-surface-400 dark:text-slate-500" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
}
