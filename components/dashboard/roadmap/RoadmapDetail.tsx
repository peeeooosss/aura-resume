'use client';

import { useState } from 'react';
import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { ROADMAP_TASK_TYPES } from '@/lib/constants/roadmap';
import { useParams } from 'next/navigation';
import { Calendar, CheckCircle2, Clock, ExternalLink, Map, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

type ViewMode = 'day' | 'week';
type TaskType = 'LEARN' | 'BUILD' | 'NETWORK' | 'APPLY' | 'INTERVIEW_PREP';

interface RoadmapTask {
  id: string;
  day: number;
  week: number;
  type: TaskType;
  title: string;
  description?: string;
  duration: number;
  affiliateLinks?: Array<{ platform: string; url: string; title: string; commission: number }>;
  isCompleted: boolean;
  completedAt?: string;
}

export function RoadmapDetail() {
  const params = useParams();
  const roadmapId = params.id as string;
  const { currentRoadmap, progress, toggleTask, getDayTasks, getWeekTasks } = useRoadmap(roadmapId);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  if (!currentRoadmap) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <Map className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Roadmap Not Found</h2>
        <p className="text-surface-500 dark:text-slate-400">This roadmap doesn't exist or has been deleted.</p>
      </div>
    );
  }

  const tasks = viewMode === 'day' ? getDayTasks(selectedDay) : getWeekTasks(selectedWeek);
  const totalWeeks = 13;
  const currentWeek = Math.ceil(
    (Date.now() - new Date(currentRoadmap.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
          <Map className="w-8 h-8 text-indigo-400" />
          {currentRoadmap.targetRole}
        </h1>
        {currentRoadmap.targetCompany && (
          <p className="text-surface-500 dark:text-slate-400 mt-1">Target: {currentRoadmap.targetCompany}</p>
        )}
      </div>

      {/* Overview Card */}
      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-surface-600 dark:text-slate-300 text-sm mb-4">{currentRoadmap.overview}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-surface-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 inline mr-1" />
                {new Date(currentRoadmap.startDate).toLocaleDateString()} - {new Date(currentRoadmap.endDate).toLocaleDateString()}
              </span>
              <span className="text-surface-500 dark:text-slate-400">
                <Clock className="w-4 h-4 inline mr-1" />
                {progress?.completed || 0}/{progress?.total || 0} tasks
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-surface-900 dark:text-white mb-1">{progress?.overall || 0}%</div>
            <p className="text-surface-400 dark:text-slate-500 text-sm">Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-surface-200 dark:bg-surface-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${currentRoadmap.progress}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-400" />
          Milestones
        </h3>
        <div className="space-y-3">
          {currentRoadmap.milestones.map((milestone: any) => {
            const isCompleted = currentWeek > milestone.week;
            const isCurrent = currentWeek === milestone.week;

            return (
              <div
                key={milestone.week}
                className={cn(
                  "p-4 rounded-2xl border transition-all",
                  isCurrent
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-surface-100 dark:bg-slate-800/50 border-surface-200 dark:border-slate-800"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                    isCurrent
                      ? "bg-indigo-500 text-white"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-700 text-surface-500 dark:text-slate-400"
                  )}>
                    {isCompleted ? "✓" : milestone.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-surface-900 dark:text-white">{milestone.theme}</h4>
                      {isCurrent && <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">Current</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {milestone.focus.map((f: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-surface-100 dark:bg-slate-800 text-surface-500 dark:text-slate-400 text-xs rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                    {milestone.deliverables.length > 0 && (
                      <div className="mt-2 text-xs text-surface-400 dark:text-slate-500">
                        Deliverables: {milestone.deliverables.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Toggle and Tasks */}
      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Tasks</h3>
          <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                viewMode === 'day' ? "bg-indigo-600 text-white" : "text-surface-500 dark:text-slate-400 hover:text-white"
              )}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                viewMode === 'week' ? "bg-indigo-600 text-white" : "text-surface-500 dark:text-slate-400 hover:text-white"
              )}
            >
              Week View
            </button>
          </div>
        </div>

        {/* Day/Week Selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-surface-400 dark:text-slate-500 flex-shrink-0" />
          {viewMode === 'day' ? (
            <div className="flex gap-2">
              {Array.from({ length: 7 }, (_: unknown, i: number) => {
                const day = selectedWeek === 1 ? i + 1 : (selectedWeek - 1) * 7 + i + 1;
                if (day > 90) return null;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg transition-colors flex-shrink-0",
                      selectedDay === day
                        ? "bg-indigo-600 text-white"
                        : "bg-surface-100 dark:bg-slate-800 text-surface-500 dark:text-slate-400 hover:text-white"
                    )}
                  >
                    Day {day}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-2">
              {Array.from({ length: totalWeeks }, (_: unknown, i: number) => i + 1).map((week: number) => (
                <button
                  key={week}
                  onClick={() => { setSelectedWeek(week); }}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors flex-shrink-0",
                    selectedWeek === week
                      ? "bg-indigo-600 text-white"
                      : "bg-surface-100 dark:bg-slate-800 text-surface-500 dark:text-slate-400 hover:text-white"
                  )}
                >
                  Week {week}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tasks List */}
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task: RoadmapTask) => {
              const taskType = ROADMAP_TASK_TYPES[task.type];
              const isExpanded = expandedTask === task.id;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "rounded-2xl border transition-all",
                    task.isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-surface-100 dark:bg-slate-800/50 border-surface-200 dark:border-slate-800"
                  )}
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        task.isCompleted
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-slate-600 hover:border-indigo-500"
                      )}
                    >
                      {task.isCompleted && <CheckCircle2 className="w-4 h-4 text-surface-900 dark:text-white" />}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium truncate",
                          task.isCompleted ? "text-surface-500 dark:text-slate-400 line-through" : "text-white"
                        )}>
                          {task.title}
                        </p>
                      </div>
                      <p className="text-surface-400 dark:text-slate-500 text-sm">{task.duration} min</p>
                    </div>

                    {/* Type Badge */}
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0",
                      taskType.bgColor, taskType.color
                    )}>
                      {taskType.icon} {taskType.label}
                    </span>

                    {/* Expand Icon */}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-surface-400 dark:text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-surface-400 dark:text-slate-500" />
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-surface-200 dark:border-slate-800">
                      {task.description && (
                        <p className="text-surface-600 dark:text-slate-300 text-sm mt-3">{task.description}</p>
                      )}

                      {/* Affiliate Links */}
                      {task.affiliateLinks && task.affiliateLinks.length > 0 && (
                        <div className="mt-4">
                          <p className="text-surface-500 dark:text-slate-400 text-xs font-medium mb-2">Recommended Resources</p>
                          <div className="space-y-2">
                            {task.affiliateLinks.map((link: any, i: number) => (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-surface-100 dark:bg-slate-800/50 rounded-xl hover:bg-surface-200 dark:hover:bg-slate-800 transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                                    {link.platform}
                                  </span>
                                  <span className="text-sm text-surface-600 dark:text-slate-300 group-hover:text-surface-900 dark:text-white transition-colors">
                                    {link.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 text-xs font-medium">
                                    {Math.round(link.commission * 100)}% off
                                  </span>
                                  <ExternalLink className="w-4 h-4 text-surface-400 dark:text-slate-500" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-surface-500 dark:text-slate-400">No tasks for this {viewMode}</p>
          </div>
        )}
      </div>
    </div>
  );
}
