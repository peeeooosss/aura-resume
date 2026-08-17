'use client';

import { useState, useEffect } from 'react';
import { FileText, Zap, ArrowRight, Sparkles, AlertTriangle, Check, History, RotateCcw, X, Download, Plus, Copy, Trash2, Edit, ExternalLink, Search } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { usePlan } from '@/lib/hooks/usePlan';
import { getPlanDefinition, canAccessFeature } from '@/lib/constants/plans';
import { useCreditsStore } from '@/lib/hooks/useCredits';

interface Template {
  id: string;
  jdText: string;
  jdUrl?: string;
  templates: {
    coverLetter: string;
    matchHighlights: string[];
    subjectLines: string[];
  };
  matchHighlights: string[];
  createdAt: string;
}

function TemplateCard({ template, onUse, onDelete, onCopy }: { template: Template; onUse: () => void; onDelete: () => void; onCopy: () => void }) {
  const date = new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl p-6 hover:border-surface-300 dark:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-surface-600 dark:text-slate-300 text-sm line-clamp-2">{template.jdText}</p>
          {template.jdUrl && (
            <a href={template.jdUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2">
              <ExternalLink className="w-3 h-3" />
              View Job Posting
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCopy} className="p-2 text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Copy cover letter">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onUse} className="p-2 text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Edit & use">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-surface-400 dark:text-slate-500 hover:text-rose-400 hover:bg-surface-200 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full">
          {(template.matchHighlights || []).length} key matches
        </span>
        <span className="text-surface-400 dark:text-slate-500 text-sm">{date}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(template.templates?.matchHighlights || []).slice(0, 3).map((highlight, i) => (
          <span key={i} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg">
            {highlight}
          </span>
        ))}
        {(template.templates?.matchHighlights || []).length > 3 && (
          <span className="px-2.5 py-1 text-xs font-medium bg-surface-100 dark:bg-slate-800 text-surface-700 dark:text-slate-400 rounded-lg">
            +{(template.templates?.matchHighlights || []).length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

function CoverLetterEditor({ template, onSave, onClose }: { template: Template | null; onSave: (letter: string) => void; onClose: () => void }) {
  const [letter, setLetter] = useState(template?.templates?.coverLetter || '');
  const [subjectLine, setSubjectLine] = useState(template?.templates?.subjectLines?.[0] || '');
  const [activeTab, setActiveTab] = useState<'letter' | 'subject'>('letter');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-surface-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Cover Letter Editor</h2>
          <button onClick={onClose} className="p-2 text-surface-400 dark:text-slate-500 hover:text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-surface-200 dark:border-slate-800">
          <button onClick={() => setActiveTab('letter')} className={cn('flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'letter' ? 'border-indigo-500 text-white' : 'text-surface-400 dark:text-slate-500 hover:text-white')}>
            Cover Letter
          </button>
          <button onClick={() => setActiveTab('subject')} className={cn('flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'subject' ? 'border-indigo-500 text-white' : 'text-surface-400 dark:text-slate-500 hover:text-white')}>
            Subject Lines
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-surface-500 dark:text-slate-400">Cover Letter</label>
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                className="w-full min-h-[400px] bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
                placeholder="Your cover letter will appear here..."
              />
            </div>
          )}

          {activeTab === 'subject' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-surface-500 dark:text-slate-400">Email Subject Line</label>
              <input
                type="text"
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
                className="w-full bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Subject: Application for [Role] at [Company]"
              />
              {(template?.templates?.subjectLines || []).slice(1).map((sl, i) => (
                <button key={i} onClick={() => setSubjectLine(sl)} className="w-full text-left px-4 py-2 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-600 dark:text-slate-300 hover:bg-surface-200 dark:hover:bg-slate-800 hover:text-surface-900 dark:text-white transition-colors">
                  {sl}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-4 border-t border-surface-200 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 px-6 py-3 bg-surface-100 dark:bg-surface-100 dark:bg-slate-800 rounded-xl text-surface-900 dark:text-white font-semibold hover:bg-surface-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSave(letter); onClose(); }} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all">
            <Download className="w-5 h-5 inline mr-2" />
            Save & Download
          </button>
        </div>
      </div>
    </div>
  );
}

export function TemplatesPage() {
  const currentPlan = usePlan(s => s.currentPlan);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [newJDText, setNewJDText] = useState('');
  const [newJDUrl, setNewJDUrl] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [resumes, setResumes] = useState<Array<{id: string; title: string}>>([]);
  const [genError, setGenError] = useState('');

  const hasAccess = currentPlan !== 'free';

  useEffect(() => {
    loadTemplates();
    loadResumes();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/templates?userId=demo-user');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadResumes = async () => {
    try {
      const res = await fetch('/api/resumes?userId=demo-user');
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!newJDText.trim() || !hasAccess) {
      if (!hasAccess) setShowUpgrade(true);
      return;
    }
    setLoading(true);
    setGenError('');
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: newJDText, jdUrl: newJDUrl, userId: 'demo-user', resumeId: resumeId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      const newTemplate: Template = {
        id: data.id || `template_${Date.now()}`,
        jdText: newJDText,
        jdUrl: newJDUrl || undefined,
        templates: {
          coverLetter: data.coverLetter || '',
          matchHighlights: data.matchHighlights || [],
          subjectLines: data.suggestedSubjectLines || [],
        },
        matchHighlights: data.matchHighlights || [],
        createdAt: new Date().toISOString(),
      };
      setTemplates([newTemplate, ...templates]);
      setNewJDText('');
      setNewJDUrl('');
      useCreditsStore.getState().refresh();
    } catch (e) {
      console.error(e);
      setGenError(e instanceof Error ? e.message : 'Cover letter generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleCopy = (letter: string) => {
    navigator.clipboard.writeText(letter);
  };

  const openEditor = (template: Template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  if (!hasAccess) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">Cover Letters</h1>
            <p className="text-surface-500 dark:text-slate-400 mt-1">Generate tailored cover letters from job descriptions</p>
          </div>
        </div>

        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Pro Feature</h2>
          <p className="text-surface-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Cover Letter Generator requires a Pro or VIP plan. Upgrade to create AI-tailored cover letters from any job description.
          </p>
          <a href="/plans" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all">
            <Sparkles className="w-4 h-4" />
            View Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">Cover Letters</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">Generate AI-tailored cover letters from job descriptions</p>
        </div>
      </div>

      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Generate New Cover Letter</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-2">Job Description</label>
            <textarea
              value={newJDText}
              onChange={(e) => setNewJDText(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full min-h-[120px] bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-2">Job URL (optional)</label>
            <input
              type="url"
              value={newJDUrl}
              onChange={(e) => setNewJDUrl(e.target.value)}
              placeholder="https://linkedin.com/jobs/view/..."
              className="w-full bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-2">Use Resume</label>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl px-4 py-3 text-surface-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a resume...</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          {genError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{genError}</span>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={!newJDText.trim() || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Generating...
              </span>
            ) : (
              <>
                <Zap className="w-5 h-5 inline mr-2" />
                Generate Cover Letter
              </>
            )}
          </button>
        </div>
      </div>

      {templates.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Your Cover Letters</h2>
            <span className="text-surface-400 dark:text-slate-500 text-sm">{templates.length} total</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => openEditor(template)}
                onDelete={() => handleDelete(template.id)}
                onCopy={() => handleCopy(template.templates?.coverLetter || '')}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No cover letters yet</h3>
          <p className="text-surface-500 dark:text-slate-400 mb-4">Generate your first AI-tailored cover letter above</p>
        </div>
      )}

      {showEditor && editingTemplate && (
        <CoverLetterEditor
          template={editingTemplate}
          onSave={(letter) => {
            const updated = templates.map(t =>
              t.id === editingTemplate.id ? { ...t, templates: { ...(t.templates || {}), coverLetter: letter } } : t
            );
            setTemplates(updated);
            closeEditor();
          }}
          onClose={closeEditor}
        />
      )}

      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-surface-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Upgrade Required</h3>
            <p className="text-surface-500 dark:text-slate-400 mb-6">Cover Letter Generator is a Pro feature. Upgrade to unlock it.</p>
            <a href="/plans" className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-center hover:shadow-lg transition-all">
              View Plans
            </a>
            <button onClick={() => setShowUpgrade(false)} className="w-full mt-3 px-6 py-3 bg-surface-100 dark:bg-surface-100 dark:bg-slate-800 rounded-xl text-surface-900 dark:text-white font-semibold hover:bg-surface-200 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}