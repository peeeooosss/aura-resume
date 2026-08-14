'use client';

import { useState, useEffect } from 'react';
import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { useRouter } from 'next/navigation';
import { Loader2, Wand2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PlanGate } from '@/components/dashboard/PlanGate';

interface Resume {
  id: string;
  fileName: string;
  atsScore: number | null;
  hasAnalysis: boolean;
}

export function RoadmapGenerate() {
  const { generateRoadmap, generating } = useRoadmap();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await fetch('/api/resumes');
        const data = await res.json();
        if (res.ok) {
          const resumeList = (data.resumes || []).map((r: any) => ({
            id: r.id,
            fileName: r.fileName || r.name || 'Untitled Resume',
            atsScore: r.atsScore,
            hasAnalysis: r.hasAnalysis || r.atsScore !== null,
          }));
          setResumes(resumeList);
        }
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  const handleGenerate = async () => {
    if (!selectedResumeId) {
      setError('Please select a resume');
      return;
    }

    setError(null);
    setSuccess(false);

    try {
      const result = await generateRoadmap(selectedResumeId);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/roadmap/${result.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap');
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
            Our AI is analyzing your resume and creating a personalized 90-day career transformation plan...
          </p>
          <div className="mt-8 space-y-3 max-w-xs mx-auto">
            <div className="h-2 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-surface-400 dark:text-slate-500 text-sm">This usually takes 10-15 seconds</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Roadmap Generated!</h2>
          <p className="text-surface-500 dark:text-slate-400">Redirecting to your roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <PlanGate
      requiredPlan="pro"
      featureName="Roadmap Generation"
      upgradeHref="/plans?plan=pro"
    >
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-indigo-400" />
          Generate Roadmap
        </h1>
        <p className="text-surface-500 dark:text-slate-400 mt-1">
          Select a resume to generate your personalized 90-day career roadmap
        </p>
      </div>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-slate-300 mb-3">
            <FileText className="w-4 h-4 text-indigo-400" />
            Select Resume *
          </label>

          {loadingResumes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-8 bg-surface-100 dark:bg-slate-800/50 rounded-2xl border border-surface-300 dark:border-slate-700">
              <FileText className="w-12 h-12 text-surface-400 dark:text-slate-500 mx-auto mb-3" />
              <p className="text-surface-500 dark:text-slate-400 mb-4">No resumes found. Upload a resume first.</p>
              <button
                onClick={() => router.push('/dashboard/resumes')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors text-sm font-medium"
              >
                Go to Resumes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map(resume => (
                <button
                  key={resume.id}
                  onClick={() => {
                    setSelectedResumeId(resume.id);
                    setError(null);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedResumeId === resume.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-surface-300 dark:border-slate-700 bg-surface-100 dark:bg-slate-800/50 hover:border-surface-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedResumeId === resume.id ? 'bg-indigo-500/20' : 'bg-surface-200 dark:bg-slate-700'
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          selectedResumeId === resume.id ? 'text-indigo-400' : 'text-surface-500 dark:text-slate-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{resume.fileName}</p>
                        <p className="text-surface-500 dark:text-slate-400 text-sm">
                          {resume.atsScore ? `ATS Score: ${resume.atsScore}/100` : 'Not analyzed'}
                        </p>
                      </div>
                    </div>
                    {selectedResumeId === resume.id && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedResume && (
          <div className="p-4 bg-surface-100 dark:bg-slate-800/50 rounded-2xl border border-surface-300 dark:border-slate-700">
            <h4 className="text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">Selected Resume</h4>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">{selectedResume.fileName}</p>
                <p className="text-surface-500 dark:text-slate-400 text-sm">
                  {selectedResume.hasAnalysis
                    ? `ATS Score: ${selectedResume.atsScore}/100 - Ready for roadmap generation`
                    : 'Will be analyzed during roadmap generation'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <p className="text-indigo-400 text-sm">
            <strong>30 credits</strong> will be used for roadmap generation.
            AI will analyze your resume, recommend the best career role, and create a personalized 90-day plan.
          </p>
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
          onClick={handleGenerate}
          disabled={!selectedResumeId || generating}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="w-5 h-5" />
          Generate Roadmap
        </button>
      </div>
    </div>
    </PlanGate>
  );
}
