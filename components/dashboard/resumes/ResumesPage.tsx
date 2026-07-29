// @ts-nocheck
'use client';

import { useState, useRef } from 'react';
import { useResumes } from '@/lib/hooks/useResumes';
import { FileText, Upload, Trash2, Edit, Star, Shield, Zap, Sparkles, Eye, Upload as UploadIcon, ChevronRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';

export function ResumesPage() {
  const { resumes, createResume, setPrimary, deleteResume } = useResumes();
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    await createResume(file);
    setSelectedFile(null);
    setShowUploader(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('word'))) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  if (resumes.length === 0 && !showUploader) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-surface-400 dark:text-slate-500" />
          </div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">No Resumes Yet</h1>
          <p className="text-surface-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Upload your first resume to get ATS analysis, tailored versions, and job matches.
          </p>
          <button
            onClick={() => setShowUploader(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <UploadIcon className="w-5 h-5" />
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">My Resumes</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Manage, analyze, and optimize your resumes</p>
        </div>
        {!showUploader && (
          <button
            onClick={() => setShowUploader(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            <UploadIcon className="w-5 h-5" />
            Upload Resume
          </button>
        )}
      </div>

      {showUploader && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mb-8 bg-white border-2 border-dashed border-surface-300 dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-8 text-center transition-colors ${
            dragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : selectedFile
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-surface-300 dark:border-slate-700 hover:border-indigo-500 bg-surface-100 dark:bg-slate-800/50'
          }`}
        >
          <UploadIcon className={`w-12 h-12 mx-auto mb-4 ${selectedFile ? 'text-emerald-400' : 'text-surface-400 dark:text-slate-500'} transition-colors`} />
          {selectedFile ? (
            <>
              <p className="text-emerald-400 font-semibold mb-1">{selectedFile.name}</p>
              <p className="text-surface-400 dark:text-slate-500 text-sm">Click or drop to replace</p>
            </>
          ) : (
            <>
              <p className="text-surface-900 dark:text-white font-semibold mb-1">Drop your resume here</p>
              <p className="text-surface-400 dark:text-slate-500 text-sm">PDF, DOCX up to 10MB</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept=".pdf,.docx"
            onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            isPrimary={resume.isPrimary}
            onSetPrimary={setPrimary}
            onDelete={deleteResume}
          />
        ))}
      </div>
    </div>
  );
}

function ResumeCard({ resume, isPrimary, onSetPrimary, onDelete }: any) {
  return (
    <div className={`group bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-5 hover:border-surface-300 dark:hover:border-slate-700 transition-all ${isPrimary ? 'border-indigo-500/30' : ''}`}>
      {isPrimary && (
        <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-full">
          Primary
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-slate-800 flex items-center justify-center">
          <FileText className="w-6 h-6 text-surface-500 dark:text-slate-400" />
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-800 transition-colors" aria-label="View resume">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-surface-400 dark:text-slate-500 hover:text-rose-400 hover:bg-surface-200 dark:hover:bg-slate-800 transition-colors" aria-label="Delete resume">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-surface-900 dark:text-white mb-1 truncate">{resume.fileName}</h3>
      <p className="text-surface-400 dark:text-slate-500 text-sm mb-4">Uploaded {formatDate(resume.createdAt)}</p>

      {resume.atsScore !== null ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-600 dark:text-slate-300">ATS Score</span>
            <span className={`text-xl font-bold ${resume.atsScore! >= 80 ? 'text-emerald-400' : resume.atsScore! >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
              {resume.atsScore}/100
            </span>
          </div>
          <div className="h-2 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${resume.atsScore! >= 80 ? 'bg-emerald-500' : resume.atsScore! >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${resume.atsScore}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-surface-100 dark:bg-slate-800/50 rounded-xl text-center">
          <Shield className="w-5 h-5 text-surface-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-surface-400 dark:text-slate-500 text-sm">Not analyzed yet</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {resume.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="px-2 py-0.5 text-xs bg-surface-100 text-surface-700 dark:bg-slate-800 dark:text-slate-300 rounded-full">{skill}</span>
        ))}
        {resume.skills.length > 4 && (
          <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">+{resume.skills.length - 4} more</span>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-surface-200 dark:border-slate-800">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:text-white font-medium transition-colors">
          <Eye className="w-4 h-4" />
          View Details
        </button>

        {!isPrimary && (
          <button
            onClick={() => onSetPrimary(resume.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-surface-600 dark:text-slate-300 hover:text-surface-900 dark:text-white font-medium transition-colors"
          >
            <Star className="w-4 h-4" />
            Set as Primary
          </button>
        )}

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
          <Sparkles className="w-4 h-4" />
          AI Rewrite
        </button>
      </div>
    </div>
  );
}