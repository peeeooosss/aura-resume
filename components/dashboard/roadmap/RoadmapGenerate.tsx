'use client';

import { useState } from 'react';
import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { useRouter } from 'next/navigation';
import { Loader2, Wand2, Target, Building2, Code2, Clock, Focus } from 'lucide-react';

export function RoadmapGenerate() {
  const { generateRoadmap, generating } = useRoadmap();
  const router = useRouter();

  const [formData, setFormData] = useState({
    targetRole: '',
    targetCompany: '',
    currentSkills: '',
    hoursPerWeek: 15,
    focusAreas: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.targetRole.trim()) newErrors.targetRole = 'Target role is required';
    if (!formData.currentSkills.trim()) newErrors.currentSkills = 'Current skills are required';
    if (!formData.focusAreas.trim()) newErrors.focusAreas = 'Focus areas are required';
    if (formData.hoursPerWeek < 5 || formData.hoursPerWeek > 40) {
      newErrors.hoursPerWeek = 'Hours must be between 5-40';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const roadmap = await generateRoadmap({
      targetRole: formData.targetRole,
      targetCompany: formData.targetCompany || undefined,
      currentSkills: formData.currentSkills.split(',').map(s => s.trim()),
      hoursPerWeek: formData.hoursPerWeek,
      focusAreas: formData.focusAreas.split(',').map(s => s.trim()),
    });

    if (roadmap) {
      router.push(`/dashboard/roadmap/${roadmap.id}`);
    }
  };

  const inputClass = "w-full bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";

  if (generating) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Generating Your Roadmap</h2>
          <p className="text-surface-500 dark:text-slate-400 max-w-md mx-auto">
            Our AI is analyzing your goals and creating a personalized 90-day career transformation plan...
          </p>
          <div className="mt-8 space-y-3 max-w-xs mx-auto">
            <div className="h-2 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-surface-400 dark:text-slate-500 text-sm">This usually takes 2-3 seconds</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-indigo-400" />
          Generate Roadmap
        </h1>
        <p className="text-surface-500 dark:text-slate-400 mt-1">Create your personalized 90-day career transformation plan</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
          {/* Target Role */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Target Role *
            </label>
            <input
              type="text"
              placeholder="e.g., Staff Frontend Engineer, Senior Product Manager"
              value={formData.targetRole}
              onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
              className={inputClass}
            />
            {errors.targetRole && <p className="text-rose-400 text-sm mt-1">{errors.targetRole}</p>}
          </div>

          {/* Target Company */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Target Company (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Google, Stripe, or 'Top tech companies'"
              value={formData.targetCompany}
              onChange={(e) => setFormData(prev => ({ ...prev, targetCompany: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Current Skills */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Current Skills *
            </label>
            <textarea
              placeholder="e.g., React, TypeScript, Node.js, REST APIs, PostgreSQL"
              value={formData.currentSkills}
              onChange={(e) => setFormData(prev => ({ ...prev, currentSkills: e.target.value }))}
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
            <p className="text-surface-400 dark:text-slate-500 text-xs mt-1">Separate skills with commas</p>
            {errors.currentSkills && <p className="text-rose-400 text-sm mt-1">{errors.currentSkills}</p>}
          </div>

          {/* Hours per Week */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Hours per Week: {formData.hoursPerWeek}h
            </label>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={formData.hoursPerWeek}
              onChange={(e) => setFormData(prev => ({ ...prev, hoursPerWeek: parseInt(e.target.value) }))}
              className="w-full h-2 bg-surface-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-surface-400 dark:text-slate-500 mt-1">
              <span>5h (Part-time)</span>
              <span>20h (Half-time)</span>
              <span>40h (Full-time)</span>
            </div>
            {errors.hoursPerWeek && <p className="text-rose-400 text-sm mt-1">{errors.hoursPerWeek}</p>}
          </div>

          {/* Focus Areas */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
              <Focus className="w-4 h-4 text-indigo-400" />
              Focus Areas *
            </label>
            <textarea
              placeholder="e.g., System Design, Technical Leadership, Interview Prep"
              value={formData.focusAreas}
              onChange={(e) => setFormData(prev => ({ ...prev, focusAreas: e.target.value }))}
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
            <p className="text-surface-400 dark:text-slate-500 text-xs mt-1">Separate areas with commas</p>
            {errors.focusAreas && <p className="text-rose-400 text-sm mt-1">{errors.focusAreas}</p>}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-surface-100 hover:bg-surface-200 text-surface-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <Wand2 className="w-5 h-5" />
            Generate Roadmap
          </button>
        </div>
      </form>
    </div>
  );
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
