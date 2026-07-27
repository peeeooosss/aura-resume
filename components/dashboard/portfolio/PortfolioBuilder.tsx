'use client';

import { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import {
  Sparkles, Globe, EyeOff, Copy, Check, ExternalLink,
  Layout, Palette, Type, Eye, Layers, ChevronDown, ChevronUp, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import Link from 'next/link';

const templates = [
  { id: 'modern', name: 'Modern', description: 'Clean and professional' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
  { id: 'creative', name: 'Creative', description: 'Bold and colorful' },
];

const colors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#10b981',
  '#06b6d4', '#3b82f6', '#000000', '#ffffff',
];

const fonts = [
  { id: 'inter', name: 'Inter' },
  { id: 'poppins', name: 'Poppins' },
  { id: 'roboto', name: 'Roboto' },
  { id: 'montserrat', name: 'Montserrat' },
];

const sections = [
  { id: 'hero', label: 'Hero', description: 'Name, headline, and avatar' },
  { id: 'about', label: 'About', description: 'Professional summary' },
  { id: 'skills', label: 'Skills', description: 'Technical skills grouped by category' },
  { id: 'experience', label: 'Experience', description: 'Work history timeline' },
  { id: 'projects', label: 'Projects', description: 'Featured projects' },
  { id: 'education', label: 'Education', description: 'Degrees and certifications' },
  { id: 'testimonials', label: 'Testimonials', description: 'Recommendations from colleagues' },
  { id: 'contact', label: 'Contact', description: 'Email, LinkedIn, GitHub' },
];

export function PortfolioBuilder() {
  const {
    currentPortfolio,
    createPortfolio,
    updatePortfolio,
    publishPortfolio,
  } = usePortfolio();

  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [selectedFont, setSelectedFont] = useState('inter');
  const [enabledSections, setEnabledSections] = useState<string[]>(
    sections.map((s) => s.id)
  );
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [slug, setSlug] = useState('arjun-sharma');

  useEffect(() => {
    if (currentPortfolio) {
      setSelectedTemplate(currentPortfolio.template || 'modern');
      setPrimaryColor(currentPortfolio.theme?.primaryColor || '#6366f1');
      setSelectedFont(currentPortfolio.theme?.font || 'inter');
      setSlug(currentPortfolio.slug || 'arjun-sharma');
    }
  }, [currentPortfolio]);

  const handleCreatePortfolio = async () => {
    await createPortfolio();
  };

  const handlePublishToggle = async () => {
    if (currentPortfolio?.isPublished) {
      updatePortfolio({ isPublished: false });
    } else {
      await publishPortfolio(slug);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/portfolio/${slug}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (sectionId: string) => {
    setEnabledSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (!currentPortfolio) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-slate-800">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Create Your Portfolio
          </h2>
          <p className="text-slate-400 mb-6">
            Build a stunning portfolio to showcase your skills and experience
          </p>

          <div className="max-w-2xl mx-auto text-left space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Choose a Template</h3>
              <div className="grid grid-cols-3 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      selectedTemplate === template.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    )}
                  >
                    <div className="font-medium text-white">{template.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Primary Color</h3>
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

            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Font</h3>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all',
                      selectedFont === font.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    )}
                  >
                    <span className="text-white">{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreatePortfolio}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              Create Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Builder</h1>
          <p className="text-slate-400 mt-1">Customize and manage your portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePublishToggle}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
              currentPortfolio.isPublished
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all"
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
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
            <p className="text-2xl font-bold text-white">{currentPortfolio.views}</p>
            <p className="text-slate-500 text-sm">Total Views</p>
          </div>
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
            <p className="text-2xl font-bold text-white">{currentPortfolio.uniqueVisitors}</p>
            <p className="text-slate-500 text-sm">Unique Visitors</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-400" />
              Sections
            </h2>
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={enabledSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{section.label}</p>
                      <p className="text-xs text-slate-500">{section.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-400" />
              Theme
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Primary Color</p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setPrimaryColor(color);
                        updatePortfolio({ theme: { ...currentPortfolio.theme, primaryColor: color, font: currentPortfolio.theme?.font || 'Inter', borderRadius: currentPortfolio.theme?.borderRadius || 'rounded-xl', spacing: currentPortfolio.theme?.spacing || 'normal' } });
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
                <p className="text-sm text-slate-400 mb-2">Template</p>
                <div className="grid grid-cols-3 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        updatePortfolio({ template: template.id as any });
                      }}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all text-center',
                        selectedTemplate === template.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      )}
                    >
                      <span className="text-sm font-medium text-white">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Settings
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Portfolio URL</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">aura.dev/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <Layers className="w-4 h-4" />
                  {enabledSections.length} sections enabled
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Eye className="w-4 h-4" />
                  {currentPortfolio.views} total views
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-6">
            <h3 className="font-semibold text-white mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/portfolio/${currentPortfolio.slug}`}
                target="_blank"
                className="block w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors text-center"
              >
                View Live Portfolio
              </Link>
              <button
                onClick={handleCopyLink}
                className="block w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors text-center"
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