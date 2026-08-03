'use client';

import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { usePlan } from '@/lib/hooks/usePlan';
import { useRouter } from 'next/navigation';
import { Map, Calendar, CheckCircle2, ArrowRight, Plus, Target, TrendingUp, Loader2, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export function RoadmapOverview() {
  const { roadmaps, loading } = useRoadmap();
  const { currentPlan } = usePlan();
  const router = useRouter();

  const activeRoadmap = roadmaps.find((r: any) => r.isActive);
  const hasAccess = currentPlan === 'pro' || currentPlan === 'vip';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
              <Map className="w-8 h-8 text-indigo-400" />
              Career Roadmap
            </h1>
            <p className="text-surface-500 dark:text-slate-400 mt-1">
              Your personalized 90-day career transformation plans
            </p>
          </div>
        </div>

        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Roadmap Requires Pro</h2>
          <p className="text-surface-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Generate AI-powered 90-day career roadmaps with tasks, videos, quizzes, projects, and interview prep.
            Upgrade to Pro to unlock.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/plans?plan=pro')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Upgrade to Pro
            </button>
            <button
              onClick={() => router.push('/plans')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface-100 dark:bg-slate-800 text-surface-900 dark:text-white font-semibold rounded-xl border border-surface-300 dark:border-slate-700 hover:border-indigo-500/50 transition-all"
            >
              View All Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
            <Map className="w-8 h-8 text-indigo-400" />
            Career Roadmap
          </h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">
            Your personalized 90-day career transformation plans
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/roadmap/generate')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Generate New Roadmap
        </button>
      </div>

      {roadmaps.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 flex items-center justify-center mx-auto mb-6">
            <Map className="w-10 h-10 text-surface-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">No Roadmaps Yet</h2>
          <p className="text-surface-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Select a resume to generate a personalized 90-day roadmap that will accelerate your career growth.
          </p>
          <button
            onClick={() => router.push('/dashboard/roadmap/generate')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Generate Your First Roadmap
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeRoadmap && (
            <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">Active</span>
                    <span className="text-surface-400 dark:text-slate-500 text-sm">
                      Started {new Date(activeRoadmap.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">{activeRoadmap.goalRole}</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-surface-900 dark:text-white">{activeRoadmap.progress}%</div>
                  <p className="text-surface-400 dark:text-slate-500 text-sm">
                    {activeRoadmap.completedTasks}/{activeRoadmap.totalTasks} tasks
                  </p>
                </div>
              </div>

              <div className="h-3 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeRoadmap.progress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-100 dark:bg-slate-800/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 dark:text-slate-400 text-sm mb-1">
                    <Target className="w-4 h-4" />
                    <span>Phase</span>
                  </div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{activeRoadmap.currentPhase}/4</p>
                </div>
                <div className="bg-surface-100 dark:bg-slate-800/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 dark:text-slate-400 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Week</span>
                  </div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{activeRoadmap.currentWeek}/13</p>
                </div>
                <div className="bg-surface-100 dark:bg-slate-800/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 dark:text-slate-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{activeRoadmap.progress}%</p>
                </div>
              </div>

              <button
                onClick={() => router.push(`/dashboard/roadmap/${activeRoadmap.id}`)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
              >
                Continue Roadmap
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">All Roadmaps</h3>
            <div className="space-y-3">
              {roadmaps.map((roadmap: any) => (
                <button
                  key={roadmap.id}
                  onClick={() => router.push(`/dashboard/roadmap/${roadmap.id}`)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all text-left",
                    roadmap.isActive
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-surface-300 dark:border-slate-700 bg-surface-100 dark:bg-slate-800/50 hover:border-surface-400 dark:hover:border-slate-600"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {roadmap.isActive && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">Active</span>
                        )}
                        <span className="text-surface-400 dark:text-slate-500 text-sm">
                          Phase {roadmap.currentPhase}/4
                        </span>
                      </div>
                      <p className="font-medium text-surface-900 dark:text-white truncate">{roadmap.goalRole}</p>
                      <p className="text-surface-500 dark:text-slate-400 text-sm">
                        Created {new Date(roadmap.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-xl font-bold text-surface-900 dark:text-white">{roadmap.progress}%</div>
                      <p className="text-surface-400 dark:text-slate-500 text-sm">
                        {roadmap.completedTasks}/{roadmap.totalTasks}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-200 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${roadmap.progress}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
