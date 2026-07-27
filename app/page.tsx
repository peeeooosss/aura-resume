'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Linkedin, Zap, ArrowRight, Sparkles, FileText } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
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
    if (!selectedFile && !linkedinUrl) return;
    setLoading(true);

    const formData = new FormData();
    if (selectedFile) formData.append('resume', selectedFile);
    if (linkedinUrl) formData.append('linkedin', linkedinUrl);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
      analyses[data.id] = data;
      localStorage.setItem('aura-analyses', JSON.stringify(analyses));
      router.push(`/results?id=${data.id}`);
    } catch {
      setLoading(false);
    }
  };

  const canSubmit = selectedFile || linkedinUrl;

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">AI-Powered Resume Optimization</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Let AI Hack the ATS.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your resume, paste your LinkedIn URL, or both. We&apos;ll analyze each source and show you exactly where you&apos;re falling short.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer rounded-2xl p-8 text-center border-2 border-dashed transition-all ${
              dragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-slate-700 hover:border-indigo-500 bg-slate-900/80'
            }`}
          >
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-xs font-semibold text-indigo-400">Resume</span>
            </div>
            <div className="mt-6">
              {selectedFile ? (
                <>
                  <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-emerald-400 font-semibold mb-1">{selectedFile.name}</p>
                  <p className="text-slate-500 text-sm">Click or drop to replace</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 transition-colors mx-auto mb-4" />
                  <p className="text-white font-semibold mb-1">Drop your resume here</p>
                  <p className="text-slate-500 text-sm">PDF, DOCX up to 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".pdf,.docx"
              onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
            />
          </div>

          <div className="rounded-2xl border border-slate-700 hover:border-blue-500 bg-slate-900/80 p-8 transition-all relative">
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="text-xs font-semibold text-blue-400">LinkedIn</span>
            </div>
            <div className="mt-6">
              <Linkedin className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-white font-semibold mb-4 text-center">Paste LinkedIn URL</p>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="linkedin.com/in/yourprofile"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm text-center"
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : (
              <>
                <Zap className="w-5 h-5 group-hover:animate-pulse" />
                {selectedFile && linkedinUrl ? 'Analyze Both' : 'Analyze My Profile'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-slate-600 text-sm mt-4">Get your ATS score in under 60 seconds</p>
        </div>
      </div>
    </main>
  );
}
