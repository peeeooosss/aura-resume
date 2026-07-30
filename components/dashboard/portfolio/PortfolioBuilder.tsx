'use client';

import { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { useResumes } from '@/lib/hooks/useResumes';
import { PORTFOLIO_TEMPLATES, type TemplateId } from '@/lib/constants/templates';
import {
  Sparkles, Globe, EyeOff, Copy, Check, ExternalLink,
  Layout, Palette, Type, Eye, Layers, ChevronDown, ChevronUp, Settings,
  FileText, Link2, Plus, Trash2, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import Link from 'next/link';

const colors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#10b981',
  '#06b6d4', '#3b82f6', '#000000', '#ffffff',
];

const fonts = [
  { id: 'Inter', name: 'Inter' },
  { id: 'Poppins', name: 'Poppins' },
  { id: 'Roboto', name: 'Roboto' },
  { id: 'Montserrat', name: 'Montserrat' },
];

const sectionDefs = [
  { id: 'hero', label: 'Hero', description: 'Name, headline, and avatar' },
  { id: 'about', label: 'About', description: 'Professional summary' },
  { id: 'skills', label: 'Skills', description: 'Technical skills grouped by category' },
  { id: 'experience', label: 'Experience', description: 'Work history timeline' },
  { id: 'projects', label: 'Projects', description: 'Featured projects' },
  { id: 'education', label: 'Education', description: 'Degrees and certifications' },
  { id: 'testimonials', label: 'Testimonials', description: 'Recommendations from colleagues' },
  { id: 'contact', label: 'Contact', description: 'Email, LinkedIn, GitHub' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function PortfolioBuilder() {
  const {
    portfolios,
    currentPortfolio,
    loading,
    saving,
    fetchPortfolio,
    createPortfolio,
    updatePortfolio,
    publishPortfolio,
    setCurrentPortfolio,
  } = usePortfolio();

  const { resumes, loading: loadingResumes } = useResumes();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [enabledSections, setEnabledSections] = useState<string[]>(
    sectionDefs.map(s => s.id)
  );
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [projectLinks, setProjectLinks] = useState<Array<{ title: string; url: string; description: string; tags: string[] }>>([]);

  useEffect(() => {
    if (currentPortfolio) {
      setSelectedTemplate(currentPortfolio.template || 'modern');
      setPrimaryColor(currentPortfolio.theme?.primaryColor || '#6366f1');
      setSelectedFont(currentPortfolio.theme?.font || 'Inter');
      setCustomSlug(currentPortfolio.slug || '');
      setEnabledSections(currentPortfolio.enabledSections || sectionDefs.map(s => s.id));
      setProjectLinks(currentPortfolio.projects || []);
      setPortfolioTitle(currentPortfolio.hero?.headline || currentPortfolio.slug);
    }
  }, [currentPortfolio]);

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const primary = resumes.find((r: any) => r.isPrimary) || resumes[0];
      if (primary) {
        setSelectedResumeId(primary.id);
        if (!portfolioTitle) setPortfolioTitle(primary.fileName || primary.name || 'My Portfolio');
        if (!customSlug) setCustomSlug(slugify(primary.fileName || primary.name || 'portfolio'));
      }
    }
  }, [resumes, selectedResumeId, portfolioTitle, customSlug]);

  const handleCreatePortfolio = async () => {
    if (!selectedResumeId || !portfolioTitle || !customSlug) return;
    const defaultTheme = PORTFOLIO_TEMPLATES.find(t => t.id === selectedTemplate)?.defaultTheme || PORTFOLIO_TEMPLATES[0].defaultTheme;
    await createPortfolio(
      selectedResumeId,
      portfolioTitle,
      customSlug,
      selectedTemplate,
      { ...defaultTheme, primaryColor, font: selectedFont }
    );
  };

  const handlePublishToggle = async () => {
    if (!currentPortfolio) return;
    await publishPortfolio(currentPortfolio.id);
  };

  const handleCopyLink = () => {
    if (!currentPortfolio) return;
    navigator.clipboard.writeText(`${window.location.origin}/portfolio/${currentPortfolio.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (sectionId: string) => {
    const updated = enabledSections.includes(sectionId)
      ? enabledSections.filter(id => id !== sectionId)
      : [...enabledSections, sectionId];
    setEnabledSections(updated);
    updatePortfolio({ enabledSections: updated } as any);
  };

  const addProjectLink = () => {
    const updated = [...projectLinks, { title: '', url: '', description: '', tags: [] }];
    setProjectLinks(updated);
    updatePortfolio({ projects: updated } as any);
  };

  const updateProjectLink = (index: number, field: string, value: any) => {
    const updated = projectLinks.map((p, i) => i === index ? { ...p, [field]: value } : p);
    setProjectLinks(updated);
    updatePortfolio({ projects: updated } as any);
  };

  const removeProjectLink = (index: number) => {
    const updated = projectLinks.filter((_, i) => i !== index);
    setProjectLinks(updated);
    updatePortfolio({ projects: updated } as any);
  };

  if (loading || loadingResumes) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!currentPortfolio) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-surface-100 dark:bg-slate-900/50 rounded-3xl border border-surface-200 dark:border-slate-800">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
            Create Your Portfolio
          </h2>
          <p className="text-surface-500 dark:text-slate-400 mb-6">
            Build a stunning portfolio to showcase your skills and experience
          </p>

          <div className="max-w-2xl mx-auto text-left space-y-6">
            {resumes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-surface-400 mx-auto mb-3" />
                <p className="text-surface-500 dark:text-slate-400 mb-4">Upload a resume first to create a portfolio</p>
                <Link href="/dashboard/resumes" className="text-indigo-400 hover:text-indigo-300 underline text-sm">
                  Upload Resume
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-medium text-surface-600 dark:text-slate-300 mb-3">Select Resume *</h3>
                  <div className="space-y-2">
                    {resumes.map((resume: any) => (
                      <button
                        key={resume.id}
                        onClick={() => {
                          setSelectedResumeId(resume.id);
                          if (!portfolioTitle) setPortfolioTitle(resume.fileName || resume.name || 'My Portfolio');
                          if (!customSlug) setCustomSlug(slugify(resume.fileName || resume.name || 'portfolio'));
                        }}
                        className={cn(
                          'w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3',
                          selectedResumeId === resume.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-surface-300 dark:border-slate-700 bg-surface-100 dark:bg-slate-800/50 hover:border-slate-600'
                        )}
                      >
                        <FileText className={cn('w-5 h-5', selectedResumeId === resume.id ? 'text-indigo-400' : 'text-surface-400')} />
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white text-sm">{resume.fileName || resume.name}</p>
                          {resume.atsScore != null && (
                            <p className="text-surface-500 dark:text-slate-400 text-xs">ATS Score: {resume.atsScore}/100</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">Portfolio Title *</h3>
                  <input
                    type="text"
                    value={portfolioTitle}
                    onChange={(e) => {
                      setPortfolioTitle(e.target.value);
                      if (!customSlug || customSlug === slugify(portfolioTitle)) {
                        setCustomSlug(slugify(e.target.value));
                      }
                    }}
                    placeholder="e.g. John Doe - Full Stack Developer"
                    className="w-full px-4 py-3 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">Custom URL Slug *</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-surface-400 dark:text-slate-500">aura.dev/</span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                      placeholder="john-doe"
                      className="flex-1 px-3 py-2 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-lg text-surface-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-surface-600 dark:text-slate-300 mb-3">Choose Template</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PORTFOLIO_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id as TemplateId)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          selectedTemplate === template.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-surface-300 dark:border-slate-700 bg-surface-100 dark:bg-slate-800/50 hover:border-slate-600'
                        )}
                      >
                        <div className="font-medium text-surface-900 dark:text-white text-sm">{template.name}</div>
                        <div className="text-xs text-surface-500 dark:text-slate-400 mt-1">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-surface-600 dark:text-slate-300 mb-3">Primary Color</h3>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setPrimaryColor(color)}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all',
                          primaryColor === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                            : 'hover:scale-110'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreatePortfolio}
                  disabled={!selectedResumeId || !portfolioTitle || !customSlug || saving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Create Portfolio
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Portfolio Builder</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1">
            {saving ? 'Saving...' : 'Customize and manage your portfolio'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePublishToggle}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
              currentPortfolio.isPublished
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-slate-700 text-surface-600 dark:text-slate-300 hover:bg-slate-600'
            )}
          >
            {currentPortfolio.isPublished ? (
              <><Globe className="w-4 h-4" /> Published</>
            ) : (
              <><EyeOff className="w-4 h-4" /> Draft</>
            )}
          </button>
          {currentPortfolio.isPublished && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-surface-600 dark:text-slate-300 rounded-xl hover:bg-slate-600 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Link
              </button>
              <Link
                href={`/portfolio/${currentPortfolio.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Preview
              </Link>
            </div>
          )}
        </div>
      </div>

      {currentPortfolio.isPublished && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-100 dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-slate-800 p-4">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{currentPortfolio.views}</p>
            <p className="text-surface-400 dark:text-slate-500 text-sm">Total Views</p>
          </div>
          <div className="bg-surface-100 dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-slate-800 p-4">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{currentPortfolio.uniqueVisitors}</p>
            <p className="text-surface-400 dark:text-slate-500 text-sm">Unique Visitors</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-400" />
              Sections
            </h2>
            <div className="space-y-2">
              {sectionDefs.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-surface-100 dark:bg-slate-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={enabledSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{section.label}</p>
                      <p className="text-xs text-surface-400 dark:text-slate-500">{section.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-400" />
              Project Links
            </h2>
            <p className="text-surface-500 dark:text-slate-400 text-sm mb-4">
              Add links to your projects, GitHub repos, or live demos
            </p>
            <div className="space-y-3">
              {projectLinks.map((project, index) => (
                <div key={index} className="p-4 bg-surface-100 dark:bg-slate-800/50 rounded-xl border border-surface-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => updateProjectLink(index, 'title', e.target.value)}
                      placeholder="Project name"
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-surface-300 dark:border-slate-600 rounded-lg text-surface-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => removeProjectLink(index)}
                      className="ml-2 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="url"
                    value={project.url}
                    onChange={(e) => updateProjectLink(index, 'url', e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-surface-300 dark:border-slate-600 rounded-lg text-surface-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={project.description}
                    onChange={(e) => updateProjectLink(index, 'description', e.target.value)}
                    placeholder="Brief description (optional)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-surface-300 dark:border-slate-600 rounded-lg text-surface-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
              <button
                onClick={addProjectLink}
                className="w-full py-3 border-2 border-dashed border-surface-300 dark:border-slate-700 rounded-xl text-surface-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Project Link
              </button>
            </div>
          </div>

          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-400" />
              Theme
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-surface-500 dark:text-slate-400 mb-2">Primary Color</p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setPrimaryColor(color);
                        updatePortfolio({ theme: { ...currentPortfolio.theme, primaryColor: color, font: selectedFont, borderRadius: 'rounded-xl', spacing: 'normal' } });
                      }}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        primaryColor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                          : 'hover:scale-110'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-slate-400 mb-2">Template</p>
                <div className="grid grid-cols-2 gap-3">
                  {PORTFOLIO_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id as TemplateId);
                        updatePortfolio({ template: template.id as TemplateId });
                      }}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all text-center',
                        selectedTemplate === template.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-surface-300 dark:border-slate-700 bg-surface-100 dark:bg-slate-800/50 hover:border-slate-600'
                      )}
                    >
                      <span className="text-sm font-medium text-surface-900 dark:text-white">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-slate-400 mb-2">Font</p>
                <div className="grid grid-cols-2 gap-2">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        setSelectedFont(font.id);
                        updatePortfolio({ theme: { ...currentPortfolio.theme, primaryColor, font: font.id, borderRadius: 'rounded-xl', spacing: 'normal' } });
                      }}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all',
                        selectedFont === font.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-surface-300 dark:border-slate-700 bg-surface-100 dark:bg-slate-800/50 hover:border-slate-600'
                      )}
                    >
                      <span className="text-surface-900 dark:text-white">{font.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Settings
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-surface-500 dark:text-slate-400 mb-2">Portfolio URL</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-surface-400 dark:text-slate-500">aura.dev/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-z0-9-]/g, '');
                      setCustomSlug(val);
                      updatePortfolio({ slug: val });
                    }}
                    className="flex-1 px-3 py-2 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-lg text-surface-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-surface-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-surface-400 dark:text-slate-500 mb-2">
                  <Layers className="w-4 h-4" />
                  {enabledSections.length} sections enabled
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-400 dark:text-slate-500">
                  <Eye className="w-4 h-4" />
                  {currentPortfolio.views} total views
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-6">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/portfolio/${currentPortfolio.slug}`}
                target="_blank"
                className="block w-full px-4 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-sm font-medium rounded-xl transition-colors text-center"
              >
                View Live Portfolio
              </Link>
              <button
                onClick={handleCopyLink}
                className="block w-full px-4 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-sm font-medium rounded-xl transition-colors text-center"
              >
                {copied ? 'Link Copied!' : 'Copy Portfolio Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
