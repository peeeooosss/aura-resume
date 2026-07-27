'use client';

import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { useRouter } from 'next/navigation';
import { ROADMAP_TASK_TYPES } from '@/lib/mock/roadmapData';
import { Map, Calendar, CheckCircle2, Clock, ArrowRight, Plus, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

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

export function RoadmapOverview() {
  const { roadmaps, currentRoadmap, progress } = useRoadmap();
  const router = useRouter();

  const activeRoadmap = roadmaps.find(r => r.isActive) || currentRoadmap;

  const today = new Date();
  const currentDay = activeRoadmap
    ? Math.ceil((today.getTime() - new Date(activeRoadmap.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const todayTasks = activeRoadmap
    ? activeRoadmap.dailyTasks.filter((t: any) => t.day === currentDay).slice(0, 5)
    : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Map className="w-8 h-8 text-indigo-400" />
            Career Roadmap
          </h1>
          <p className="text-slate-400 mt-1">Your personalized 90-day career transformation plan</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/roadmap/generate')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Generate New Roadmap
        </button>
      </div>

      {activeRoadmap ? (
        <>
          {/* Active Roadmap Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">Active</span>
                  <span className="text-slate-500 text-sm">Started {new Date(activeRoadmap.startDate).toLocaleDateString()}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{activeRoadmap.targetRole}</h2>
                {activeRoadmap.targetCompany && (
                  <p className="text-slate-400 text-sm mt-1">Target: {activeRoadmap.targetCompany}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{progress?.overall || 0}%</div>
                <p className="text-slate-500 text-sm">{progress?.completed || 0}/{progress?.total || 0} tasks</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${activeRoadmap.progress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Current Day</span>
                </div>
                <p className="text-2xl font-bold text-white">Day {currentDay}</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Target className="w-4 h-4" />
                  <span>Current Week</span>
                </div>
                <p className="text-2xl font-bold text-white">Week {Math.ceil(currentDay / 7)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Remaining</span>
                </div>
                <p className="text-2xl font-bold text-white">{90 - currentDay} days</p>
              </div>
            </div>
          </div>

          {/* Milestones Timeline */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Map className="w-5 h-5 text-indigo-400" />
              Milestones Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRoadmap.milestones.slice(0, 6).map((milestone: any) => {
                const weekNum = milestone.week;
                const currentWeek = Math.ceil(currentDay / 7);
                const isCompleted = currentWeek > weekNum;
                const isCurrent = currentWeek === weekNum;

                return (
                  <div
                    key={weekNum}
                    className={cn(
                      "relative p-4 rounded-2xl border transition-all",
                      isCurrent
                        ? "bg-indigo-500/10 border-indigo-500/30"
                        : isCompleted
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-slate-800/50 border-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        isCurrent
                          ? "bg-indigo-500 text-white"
                          : isCompleted
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-700 text-slate-400"
                      )}>
                        {isCompleted ? "✓" : weekNum}
                      </span>
                      <span className="text-sm font-medium text-slate-300">Week {weekNum}</span>
                    </div>
                    <h4 className="font-medium text-white text-sm mb-1">{milestone.theme}</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {milestone.focus.slice(0, 2).map((f: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full">
                          {f}
                        </span>
                      ))}
                      {milestone.focus.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-500 text-xs rounded-full">
                          +{milestone.focus.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {activeRoadmap.milestones.length > 6 && (
              <button
                onClick={() => router.push(`/dashboard/roadmap/${activeRoadmap.id}`)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
              >
                View all {activeRoadmap.milestones.length} milestones
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Today's Tasks */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Today's Tasks (Day {currentDay})
              </h3>
              <button
                onClick={() => router.push(`/dashboard/roadmap/${activeRoadmap.id}`)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
              >
                View all tasks
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map((task: RoadmapTask) => {
                  const taskType = ROADMAP_TASK_TYPES[task.type];
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                        task.isCompleted
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-slate-800/50 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", taskType.bgColor)}>
                        <span className="text-lg">{taskType.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          task.isCompleted ? "text-slate-400 line-through" : "text-white"
                        )}>
                          {task.title}
                        </p>
                        <p className="text-slate-500 text-sm">{task.duration} min</p>
                      </div>
                      <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", taskType.bgColor, taskType.color)}>
                        {taskType.label}
                      </span>
                      {task.isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No tasks for today</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mx-auto mb-6">
            <Map className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No Active Roadmap</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Generate a personalized 90-day roadmap to accelerate your career transition.
          </p>
          <button
            onClick={() => router.push('/dashboard/roadmap/generate')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Generate Your Roadmap
          </button>
        </div>
      )}
    </div>
  );
}
