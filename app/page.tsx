'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Zap, ArrowRight, Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('userId', 'demo-user');

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Analysis failed');
        setLoading(false);
        return;
      }
      // Store full result in sessionStorage for results page
      sessionStorage.setItem(`aura-result-${data.id}`, JSON.stringify({
        id: data.id,
        createdAt: new Date().toISOString(),
        resume: data.resume,
        linkedin: data.linkedin,
        coverLetter: data.coverLetter,
        creditsUsed: data.creditsUsed,
        creditsRemaining: data.creditsRemaining,
      }));
      router.push(`/results?id=${data.id}`);
    } catch {
      setLoading(false);
    }
  };

  const canSubmit = !!selectedFile;

  return (
    <main className="min-h-screen bg-surface-50 dark:bg-slate-950">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-surface-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-indigo-400" />
            <span className="text-surface-900 dark:text-white font-semibold text-lg">Aura Resume</span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-5xl py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-8">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">AI-Powered Resume Optimization</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-surface-900 dark:text-white mb-4 leading-tight">
              Let AI Hack the ATS.
            </h1>
            <p className="text-lg text-surface-500 dark:text-slate-400 max-w-2xl mx-auto">
              Upload your resume and get an instant ATS compatibility score with detailed insights.
            </p>
          </div>

          <div className="mb-12">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer rounded-2xl p-8 text-center border-2 border-dashed transition-all ${
                dragging
                  ? 'border-primary-500 bg-primary-500/10'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-surface-300 dark:border-slate-700 hover:border-primary-500 bg-white dark:bg-slate-900/80'
              }`}
            >
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">Resume</span>
              </div>
              <div className="mt-6">
                {selectedFile ? (
                  <>
                    <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-400 font-semibold mb-1">{selectedFile.name}</p>
                    <p className="text-surface-500 dark:text-slate-500 text-sm">Click or drop to replace</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="mt-3 text-sm text-surface-500 dark:text-slate-500 hover:text-surface-900 dark:hover:text-white underline"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-surface-500 dark:text-slate-500 group-hover:text-primary-400 transition-colors mx-auto mb-4" />
                    <p className="text-surface-900 dark:text-white font-semibold mb-1">Drop your resume here</p>
                    <p className="text-surface-500 dark:text-slate-500 text-sm">PDF, DOCX up to 10MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 opacity-0 pointer-events-none"
                accept=".pdf,.docx"
                onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
              />
            </div>

            <div className="mt-8 text-center text-surface-500 dark:text-slate-500 text-sm">
              LinkedIn Analyser available in Dashboard (Pro plan)
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="animate-pulse">Analyzing...</span>
              ) : (
                <>
                  <Zap className="w-5 h-5 group-hover:animate-pulse" />
                  Analyze My Resume
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-surface-500 dark:text-slate-500 text-sm mt-4">Get your ATS score in under 60 seconds</p>
          </div>
        </div>
      </div>
    </main>
  );
}