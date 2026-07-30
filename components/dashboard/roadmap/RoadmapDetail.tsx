'use client';

import { useState } from 'react';
import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { ROADMAP_TASK_TYPES } from '@/lib/constants/roadmap';
import { useParams } from 'next/navigation';
import { Map, CheckCircle2, Clock, ExternalLink, ChevronDown, ChevronUp, Lock, Loader2, ArrowLeft, BookOpen, Play, Brain, Folder, Mic, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { VideoSection } from './VideoSection';
import { QuizSection } from './QuizSection';
import { ProjectSection } from './ProjectSection';
import { AIInterviewSection } from './AIInterviewSection';
import type { PhaseContent } from '@/lib/types/roadmap';

const PHASE_TAB_CONFIG = [
  { icon: ListTodo, label: 'Tasks', key: 'tasks' },
  { icon: Play, label: 'Videos', key: 'videos' },
  { icon: Brain, label: 'Quiz', key: 'quiz' },
  { icon: Folder, label: 'Projects', key: 'projects' },
  { icon: Mic, label: 'AI Interview', key: 'interview' },
] as const;

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

  const [activePhase, setActivePhase] = useState(1);
  const [activeContentTab, setActiveContentTab] = useState<string>('tasks');
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
        <p className="text-surface-500 dark:text-slate-400">This roadmap doesn't exist or has been deleted.</p>
      </div>
    );
  }

  const phases = (currentRoadmap.phases as any[]) || [];
  const currentPhase = phases.find((p: any) => p.phase === activePhase) || phases[0];
  const phaseProgress = currentPhase ? getPhaseProgress(currentPhase) : { total: 0, completed: 0, percentage: 0 };
  const phaseContent: PhaseContent | null = currentPhase?.phaseContent || null;

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roadmaps
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content: 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header card */}
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-3 mb-2">
                  <Map className="w-7 h-7 text-indigo-400" />
                  {currentRoadmap.goalRole}
                </h1>
                <p className="text-surface-500 dark:text-slate-400 text-sm">{currentRoadmap.overview}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-surface-900 dark:text-white mb-1">{currentRoadmap.progress}%</div>
                <p className="text-surface-400 dark:text-slate-500 text-sm">Complete</p>
              </div>
            </div>
            <div className="h-3 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${currentRoadmap.progress}%` }}
              />
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-surface-500 dark:text-slate-400">
              <span><Clock className="w-4 h-4 inline mr-1" />{currentRoadmap.completedTasks}/{currentRoadmap.totalTasks} tasks</span>
              <span>Phase {currentRoadmap.currentPhase}/4</span>
            </div>
          </div>

          {/* Phase tabs (top) */}
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex border-b border-surface-200 dark:border-slate-800 overflow-x-auto">
              {phases.map((phase: any) => (
                <button
                  key={phase.phase}
                  onClick={() => { setActivePhase(phase.phase); setActiveContentTab('tasks'); }}
                  className={cn(
                    'flex-1 min-w-[120px] px-4 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap',
                    activePhase === phase.phase
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  Phase {phase.phase}
                  <span className="block text-xs font-normal mt-0.5 opacity-70">{phase.title}</span>
                </button>
              ))}
            </div>

            {/* Content sub-tabs */}
            <div className="flex border-b border-surface-200 dark:border-slate-800 overflow-x-auto px-4">
              {PHASE_TAB_CONFIG.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveContentTab(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap',
                    activeContentTab === tab.key
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-surface-400 dark:text-slate-500 hover:text-surface-600 dark:hover:text-slate-300'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Phase progress bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-surface-500 dark:text-slate-400">{phaseProgress.completed}/{phaseProgress.total} days complete</span>
                <span className="font-semibold text-surface-900 dark:text-white">{phaseProgress.percentage}%</span>
              </div>
              <div className="h-2 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${phaseProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* Content area */}
            <div className="px-6 pb-6">
              {activeContentTab === 'tasks' && (
                <div className="space-y-3">
                  {currentPhase?.weeksData?.map((week: any) => (
                    <div key={week.week} className={cn(
                      "rounded-xl border transition-all",
                      week.isUnlocked
                        ? "border-surface-300 dark:border-slate-700"
                        : "border-surface-200 dark:border-slate-800 opacity-50"
                    )}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-medium text-surface-900 dark:text-white text-sm">Week {week.week}: {week.title}</h4>
                          {!week.isUnlocked && <Lock className="w-3.5 h-3.5 text-surface-400 dark:text-slate-500" />}
                        </div>
                        {week.isUnlocked && (
                          <div className="space-y-2">
                            {week.days.map((day: any) => (
                              <div
                                key={day.day}
                                className={cn(
                                  "rounded-lg border transition-all",
                                  day.isCompleted
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : "bg-white dark:bg-slate-800 border-surface-200 dark:border-slate-700"
                                )}
                              >
                                <div className="flex items-center gap-3 p-3">
                                  <button
                                    onClick={() => handleCompleteTask(day.day, `day-${day.day}`)}
                                    disabled={completingTask === `day-${day.day}`}
                                    className={cn(
                                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                      day.isCompleted
                                        ? "bg-emerald-500 border-emerald-500"
                                        : "border-slate-400 dark:border-slate-600 hover:border-indigo-500"
                                    )}
                                  >
                                    {completingTask === `day-${day.day}` ? (
                                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                                    ) : day.isCompleted ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    ) : null}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "font-medium text-sm",
                                      day.isCompleted ? "text-surface-500 dark:text-slate-400 line-through" : "text-surface-900 dark:text-white"
                                    )}>
                                      Day {day.day}: {day.title}
                                    </p>
                                    <p className="text-surface-400 dark:text-slate-500 text-xs">{day.duration} min</p>
                                  </div>

                                  {(() => {
                                    const taskType = ROADMAP_TASK_TYPES[day.type as keyof typeof ROADMAP_TASK_TYPES];
                                    return taskType ? (
                                      <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", taskType.bgColor, taskType.color)}>
                                        {taskType.icon} {taskType.label}
                                      </span>
                                    ) : null;
                                  })()}

                                  <button
                                    onClick={() => setExpandedTask(expandedTask === `day-${day.day}` ? null : `day-${day.day}`)}
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
                                  <div className="px-3 pb-3 border-t border-surface-200 dark:border-slate-700">
                                    <p className="text-surface-600 dark:text-slate-300 text-sm mt-2">{day.description}</p>
                                    {day.resources && day.resources.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-surface-500 dark:text-slate-400 text-xs font-medium mb-2">Resources</p>
                                        {day.resources.map((resource: any, idx: number) => (
                                          <a
                                            key={idx}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-2 bg-surface-100 dark:bg-slate-800/50 rounded-lg hover:bg-surface-200 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <span className="text-sm text-surface-600 dark:text-slate-300">{resource.title}</span>
                                            <ExternalLink className="w-3 h-3 text-surface-400 dark:text-slate-500" />
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeContentTab === 'videos' && <VideoSection videos={phaseContent?.videos || []} />}
              {activeContentTab === 'quiz' && <QuizSection quiz={phaseContent?.quiz || []} />}
              {activeContentTab === 'projects' && <ProjectSection projects={phaseContent?.projects || []} />}
              {activeContentTab === 'interview' && (
                <AIInterviewSection questions={phaseContent?.aiInterview || []} />
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Your Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {currentRoadmap.currentStrengths?.map((strength: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">
                  {strength}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Critical Gaps</h3>
            <div className="space-y-2.5">
              {currentRoadmap.criticalGaps?.map((gap: any, idx: number) => (
                <div key={idx} className="p-3 bg-surface-50 dark:bg-slate-800/50 rounded-xl border border-surface-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-surface-900 dark:text-white text-xs">{gap.skill}</p>
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-semibold rounded-full",
                      gap.importance === 'high' ? "bg-rose-500/10 text-rose-400" :
                      gap.importance === 'medium' ? "bg-amber-500/10 text-amber-400" :
                      "bg-surface-200 dark:bg-slate-700 text-surface-500 dark:text-slate-400"
                    )}>
                      {gap.importance}
                    </span>
                  </div>
                  <p className="text-surface-400 dark:text-slate-500 text-[11px]">{gap.timeToLearn}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phase milestone */}
          {currentPhase?.milestone && (
            <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-2">Phase Milestone</h3>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-indigo-400 font-medium text-sm">{currentPhase.milestone.title}</p>
                <p className="text-surface-500 dark:text-slate-400 text-xs mt-1">{currentPhase.milestone.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
