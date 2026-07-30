'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { RoadmapData, RoadmapPhase, RoadmapWeek, RoadmapDay, SkillGap } from '@/lib/types/roadmap';

export type { RoadmapData, RoadmapPhase, RoadmapWeek, RoadmapDay, SkillGap };

export function useRoadmap(roadmapId?: string) {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmaps = useCallback(async () => {
    try {
      const res = await fetch('/api/roadmap');
      const data = await res.json();
      if (res.ok) {
        setRoadmaps(data.roadmaps || []);
      }
    } catch (err) {
      console.error('Failed to fetch roadmaps:', err);
    }
  }, []);

  const fetchRoadmap = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/roadmap/${id}`);
      const data = await res.json();
      if (res.ok) {
        setCurrentRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error('Failed to fetch roadmap:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  useEffect(() => {
    if (roadmapId) {
      fetchRoadmap(roadmapId);
    }
  }, [roadmapId, fetchRoadmap]);

  const generateRoadmap = useCallback(async (resumeId: string) => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Roadmap generation failed');
      }

      await fetchRoadmaps();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [fetchRoadmaps]);

  const completeTask = useCallback(async (roadmapId: string, dayNumber: number, taskId: string) => {
    try {
      const res = await fetch(`/api/roadmap/${roadmapId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      const data = await res.json();
      if (res.ok && data.roadmap) {
        setCurrentRoadmap(data.roadmap);
        await fetchRoadmaps();
      }
      return data;
    } catch (err) {
      console.error('Failed to complete task:', err);
      throw err;
    }
  }, [fetchRoadmaps]);

  const unlockPhase = useCallback(async (roadmapId: string, phaseNumber: number) => {
    try {
      const res = await fetch(`/api/roadmap/${roadmapId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlock_phase', phaseNumber }),
      });
      const data = await res.json();
      if (res.ok && data.roadmap) {
        setCurrentRoadmap(data.roadmap);
        await fetchRoadmaps();
      }
      return data;
    } catch (err) {
      console.error('Failed to unlock phase:', err);
      throw err;
    }
  }, [fetchRoadmaps]);

  const getPhaseProgress = useCallback((phase: RoadmapPhase) => {
    let total = 0;
    let completed = 0;
    phase.weeksData.forEach(week => {
      week.days.forEach(day => {
        total++;
        if (day.isCompleted) completed++;
      });
    });
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, []);

  const isPhaseUnlocked = useCallback((roadmap: any, phaseNumber: number): boolean => {
    if (!roadmap) return false;
    const phaseKey = `phase${phaseNumber}Unlocked` as keyof typeof roadmap;
    return roadmap[phaseKey] as boolean;
  }, []);

  const isPhaseComplete = useCallback((roadmap: any, phaseNumber: number): boolean => {
    if (!roadmap?.phases) return false;
    const phase = roadmap.phases.find((p: any) => p.phase === phaseNumber);
    if (!phase) return false;
    const { total, completed } = getPhaseProgress(phase);
    return total > 0 && completed === total;
  }, [getPhaseProgress]);

  const canUnlockNextPhase = useCallback((roadmap: any, currentPhase: number): boolean => {
    if (currentPhase >= 4) return false;
    return isPhaseComplete(roadmap, currentPhase);
  }, [isPhaseComplete]);

  const currentPhase = currentRoadmap?.phases?.find((p: any) => p.phase === currentRoadmap?.currentPhase) || null;

  return {
    roadmaps,
    currentRoadmap,
    currentPhase,
    loading,
    generating,
    error,
    fetchRoadmaps,
    fetchRoadmap,
    generateRoadmap,
    completeTask,
    unlockPhase,
    getPhaseProgress,
    isPhaseUnlocked,
    isPhaseComplete,
    canUnlockNextPhase,
    setCurrentRoadmap,
  };
}
