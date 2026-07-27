'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MOCK_ROADMAPS } from '@/lib/mock/roadmapData';

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
  const [roadmaps, setRoadmaps] = useState<any[]>(MOCK_ROADMAPS);
  const [currentRoadmap, setCurrentRoadmap] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (roadmapId) {
      const found = roadmaps.find(r => r.id === roadmapId);
      setCurrentRoadmap(found || null);
    } else if (roadmaps.length > 0) {
      setCurrentRoadmap(roadmaps[0]);
    }
  }, [roadmapId, roadmaps]);

  const dayTasks = useMemo(() => {
    if (!currentRoadmap) return {};
    const tasksByDay: Record<number, RoadmapTask[]> = {};
    currentRoadmap.dailyTasks.forEach((task: RoadmapTask) => {
      if (!tasksByDay[task.day]) tasksByDay[task.day] = [];
      tasksByDay[task.day].push(task);
    });
    return tasksByDay;
  }, [currentRoadmap]);

  const weekTasks = useMemo(() => {
    if (!currentRoadmap) return {};
    const tasksByWeek: Record<number, RoadmapTask[]> = {};
    currentRoadmap.dailyTasks.forEach((task: RoadmapTask) => {
      if (!tasksByWeek[task.week]) tasksByWeek[task.week] = [];
      tasksByWeek[task.week].push(task);
    });
    return tasksByWeek;
  }, [currentRoadmap]);

  const getDayTasks = useCallback((day: number) => dayTasks[day] || [], [dayTasks]);
  const getWeekTasks = useCallback((week: number) => weekTasks[week] || [], [weekTasks]);

  const toggleTask = useCallback((taskId: string) => {
    setRoadmaps(prev => prev.map(rm => ({
      ...rm,
      dailyTasks: rm.dailyTasks.map((t: RoadmapTask) => 
        t.id === taskId 
          ? { ...t, isCompleted: !t.isCompleted, completedAt: t.isCompleted ? undefined : new Date().toISOString() }
          : t
      ),
      completedTasks: rm.dailyTasks.filter((t: RoadmapTask) => t.id === taskId)[0]?.isCompleted 
        ? rm.completedTasks - 1 
        : rm.completedTasks + 1,
      progress: Math.round(((rm.dailyTasks.filter((t: RoadmapTask) => t.id === taskId)[0]?.isCompleted ? rm.completedTasks - 1 : rm.completedTasks + 1) / rm.totalTasks) * 100),
      updatedAt: new Date().toISOString(),
    })));
    
    if (currentRoadmap) {
      setCurrentRoadmap((prev: any) => prev ? {
        ...prev,
        dailyTasks: prev.dailyTasks.map((t: RoadmapTask) => 
          t.id === taskId 
            ? { ...t, isCompleted: !t.isCompleted, completedAt: t.isCompleted ? undefined : new Date().toISOString() }
            : t
        ),
        completedTasks: prev.dailyTasks.filter((t: RoadmapTask) => t.id === taskId)[0]?.isCompleted 
          ? prev.completedTasks - 1 
          : prev.completedTasks + 1,
        progress: Math.round(((prev.dailyTasks.filter((t: RoadmapTask) => t.id === taskId)[0]?.isCompleted ? prev.completedTasks - 1 : prev.completedTasks + 1) / prev.totalTasks) * 100),
        updatedAt: new Date().toISOString(),
      } : null);
    }
  }, [currentRoadmap, dayTasks]);

  const generateRoadmap = useCallback(async (params: {
    targetRole: string;
    targetCompany?: string;
    currentSkills: string[];
    hoursPerWeek: number;
    focusAreas: string[];
  }) => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 3000));
    
    const newRoadmap: Roadmap = {
      id: `roadmap_${Date.now()}`,
      userId: 'user_1',
      targetRole: params.targetRole,
      targetCompany: params.targetCompany,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      overview: `Bridge the gap to ${params.targetRole} by mastering ${params.focusAreas.join(', ')}. Focus on ${params.hoursPerWeek} hours/week across learning, building, and networking.`,
      milestones: Array.from({ length: 13 }, (_, i) => ({
        week: i + 1,
        theme: `Week ${i + 1} Theme`,
        focus: ['Focus area 1', 'Focus area 2'],
        deliverables: ['Deliverable 1', 'Deliverable 2'],
      })),
      dailyTasks: Array.from({ length: 90 }, (_, i) => ({
        id: `task_${i + 1}`,
        day: i + 1,
        week: Math.floor(i / 7) + 1,
        type: ['LEARN', 'BUILD', 'NETWORK', 'APPLY', 'INTERVIEW_PREP'][i % 5] as RoadmapTask['type'],
        title: `Task for day ${i + 1}`,
        duration: 60 + (i % 3) * 30,
        isCompleted: false,
        affiliateLinks: i % 7 === 0 ? [{ platform: 'udemy', url: '#', title: 'Relevant Course', commission: 0.15 }] : undefined,
      })),
      progress: 0,
      completedTasks: 0,
      totalTasks: 90,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setRoadmaps(prev => [newRoadmap, ...prev]);
    setCurrentRoadmap(newRoadmap);
    setGenerating(false);
    return newRoadmap;
  }, []);

  const progress = currentRoadmap ? {
    overall: currentRoadmap.progress,
    completed: currentRoadmap.completedTasks,
    total: currentRoadmap.totalTasks,
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