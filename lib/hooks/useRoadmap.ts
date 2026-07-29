'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

export interface RoadmapTask {
  id: string;
  day: number;
  week: number;
  type: 'LEARN' | 'BUILD' | 'NETWORK' | 'APPLY' | 'INTERVIEW_PREP';
  title: string;
  description?: string;
  duration: number;
  resources?: Array<{ type: string; url: string; title: string; commission?: number }>;
  isCompleted: boolean;
  completedAt?: string;
  affiliateLinks?: Array<{ platform: string; url: string; title: string; commission: number }>;
}

export interface Roadmap {
  id: string;
  userId: string;
  resumeId?: string;
  targetRole: string;
  targetCompany?: string;
  startDate: string;
  endDate: string;
  overview: string;
  milestones: Array<{ week: number; theme: string; focus: string[]; deliverables: string[] }>;
  dailyTasks: RoadmapTask[];
  progress: number;
  completedTasks: number;
  totalTasks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useRoadmap(roadmapId?: string) {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (roadmapId) {
      setCurrentRoadmapsById(roadmapId);
    }
  }, [roadmapId]);

  const setCurrentRoadmapsById = useCallback((id: string) => {
    setCurrentRoadmap(roadmaps.find(r => r.id === id) || null);
  }, [roadmaps]);

  useEffect(() => {
    if (!roadmapId && roadmaps.length > 0) {
      setCurrentRoadmap(roadmaps[0]);
    }
  }, [roadmapId, roadmaps]);

  const dayTasks = useMemo(() => {
    if (!currentRoadmap) return {};
    const tasksByDay: Record<number, RoadmapTask[]> = {};
    (currentRoadmap.dailyTasks || []).forEach((task: RoadmapTask) => {
      if (!tasksByDay[task.day]) tasksByDay[task.day] = [];
      tasksByDay[task.day].push(task);
    });
    return tasksByDay;
  }, [currentRoadmap]);

  const weekTasks = useMemo(() => {
    if (!currentRoadmap) return {};
    const tasksByWeek: Record<number, RoadmapTask[]> = {};
    (currentRoadmap.dailyTasks || []).forEach((task: RoadmapTask) => {
      if (!tasksByWeek[task.week]) tasksByWeek[task.week] = [];
      tasksByWeek[task.week].push(task);
    });
    return tasksByWeek;
  }, [currentRoadmap]);

  const getDayTasks = useCallback((day: number) => dayTasks[day] || [], [dayTasks]);
  const getWeekTasks = useCallback((week: number) => weekTasks[week] || [], [weekTasks]);

  const toggleTask = useCallback((taskId: string) => {
    if (!currentRoadmap) return;
    const updatedTasks = currentRoadmap.dailyTasks.map((t: RoadmapTask) =>
      t.id === taskId
        ? { ...t, isCompleted: !t.isCompleted, completedAt: t.isCompleted ? undefined : new Date().toISOString() }
        : t
    );
    const completedCount = updatedTasks.filter((t: RoadmapTask) => t.isCompleted).length;
    const updatedRoadmap = {
      ...currentRoadmap,
      dailyTasks: updatedTasks,
      completedTasks: completedCount,
      progress: Math.round((completedCount / currentRoadmap.totalTasks) * 100),
      updatedAt: new Date().toISOString(),
    };
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r));
  }, [currentRoadmap]);

  const generateRoadmap = useCallback(async (params: {
    targetRole: string;
    targetCompany?: string;
    currentSkills: string[];
    hoursPerWeek: number;
    focusAreas: string[];
  }) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRole: params.currentSkills[0] || 'Software Engineer',
          goalRole: params.targetRole,
          skills: params.currentSkills,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Roadmap generation failed');

      const newRoadmap = data;
      setRoadmaps(prev => [newRoadmap, ...prev]);
      setCurrentRoadmap(newRoadmap);
      return newRoadmap;
    } catch (err) {
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const progress = currentRoadmap ? {
    overall: currentRoadmap.progress || 0,
    completed: currentRoadmap.completedTasks || 0,
    total: currentRoadmap.totalTasks || 0,
    currentStreak: 0,
    longestStreak: 0,
  } : null;

  return {
    roadmaps,
    currentRoadmap,
    generating,
    dayTasks,
    weekTasks,
    getDayTasks,
    getWeekTasks,
    toggleTask,
    generateRoadmap,
    progress,
    setCurrentRoadmap,
  };
}
