// @ts-nocheck
'use client';

import { useState } from 'react';
import { useResumes } from '@/lib/hooks/useResumes';
import { usePlan } from '@/lib/hooks/usePlan';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/helpers';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  FileText, ArrowLeft, Star, Shield, Sparkles, ChevronDown,
  ChevronUp, AlertTriangle, CheckCircle, TrendingUp, Target,
  Award, Briefcase, GraduationCap, Code, Globe, Languages,
  Download, Trash2, Clock, BarChart3, Eye, Loader2, Lock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/helpers';

type Tab = 'overview' | 'sections' | 'ats' | 'optimize';

export default function ResumeDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { resumes, deleteResume, setPrimary } = useResumes();
  const { toast } = useToast();
  const router = useRouter();
  const currentPlan = usePlan(s => s.currentPlan);
  const resume = resumes.find(r => r.id === id);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSetPrimary = async () => {
    const ok = await setPrimary(id);
    toast(ok ? 'success' : 'error', ok ? 'Primary resume updated' : 'Failed to set primary resume');
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    const ok = await deleteResume(id);
    setDeleting(false);
    setConfirmDelete(false);
    if (ok) {
      toast('success', 'Resume deleted');
      router.push('/dashboard/resumes');
    } else {
      toast('error', 'Failed to delete resume');
    }
  };

  if (!resume) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Resume Not Found</h1>
        <p className="text-surface-500 dark:text-slate-400 mb-6">The resume you're looking for doesn't exist.</p>
        <Link
          href="/dashboard/resumes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-medium rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resumes
        </Link>
      </div>
    );
  }

  const handleRewrite = async () => {
    setRewriting(true);
    await new Promise(r => setTimeout(r, 2000));
    setRewriting(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const isPro = currentPlan === 'pro' || currentPlan === 'vip';

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'sections', label: 'Sections', icon: FileText },
    { id: 'ats', label: 'ATS Analysis', icon: BarChart3 },
    { id: 'optimize', label: 'Optimize', icon: Sparkles },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/resumes"
            className="p-2 rounded-xl bg-surface-100 dark:bg-slate-800/50 hover:bg-surface-200 dark:hover:bg-slate-800 text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{resume.fileName}</h1>
              <p className="text-surface-500 dark:text-slate-400 text-sm">
                Uploaded {formatDate(resume.createdAt)}
                {resume.isPrimary && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-400 rounded-full">Primary</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {resume.atsScore !== null && (
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-slate-800/50 rounded-xl border border-surface-300 dark:border-slate-700">
              <Shield className={cn('w-5 h-5', resume.atsScore >= 80 ? 'text-emerald-400' : resume.atsScore >= 60 ? 'text-amber-400' : 'text-rose-400')} />
              <span className="text-lg font-bold text-surface-900 dark:text-white">{resume.atsScore}</span>
              <span className="text-surface-400 dark:text-slate-500 text-sm">/ 100</span>
            </div>
          )}
          {!resume.isPrimary && (
            <button
              onClick={handleSetPrimary}
              className="p-2 rounded-xl bg-surface-100 dark:bg-slate-800/50 hover:bg-surface-200 dark:hover:bg-slate-800 text-surface-500 dark:text-slate-400 hover:text-amber-400 transition-colors"
              title="Set as Primary"
            >
              <Star className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 rounded-xl bg-surface-100 dark:bg-slate-800/50 hover:bg-surface-200 dark:hover:bg-slate-800 text-surface-500 dark:text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Resume"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-surface-500 dark:text-slate-400 hover:text-white hover:bg-surface-100 dark:bg-slate-800/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Skills */}
          {resume.skills.length > 0 && (
            <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Skills</h2>
                <span className="text-surface-400 dark:text-slate-500 text-sm">({resume.skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 text-sm bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 text-surface-600 dark:text-slate-300 rounded-full hover:border-indigo-500/30 hover:text-indigo-300 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Experience Summary */}
          {resume.experience.length > 0 && (
            <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Experience</h2>
                <span className="text-surface-400 dark:text-slate-500 text-sm">({resume.experience.length} roles)</span>
              </div>
              <div className="space-y-4">
                {resume.experience.map(exp => (
                  <div key={exp.id} className="p-4 bg-surface-100 dark:bg-slate-800/30 rounded-2xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white">{exp.role}</h3>
                        <p className="text-surface-500 dark:text-slate-400 text-sm">{exp.company} · {exp.location}</p>
                      </div>
                      <span className="text-surface-400 dark:text-slate-500 text-sm shrink-0">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {exp.bullets.map((bullet, i) => (
                        <li key={i} className="text-surface-500 dark:text-slate-400 text-sm flex items-start gap-2">
                          <span className="text-indigo-400 mt-1">•</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    {exp.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {exp.tech.map(t => (
                          <span key={t} className="px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-400 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Education</h2>
              </div>
              <div className="space-y-3">
                {resume.education.map(edu => (
                  <div key={edu.id} className="p-4 bg-surface-100 dark:bg-slate-800/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">{edu.degree}</h3>
                      <p className="text-surface-500 dark:text-slate-400 text-sm">{edu.school}</p>
                      {edu.honors && <p className="text-amber-400/80 text-sm mt-1">{edu.honors}</p>}
                    </div>
                    <span className="text-surface-400 dark:text-slate-500 text-sm shrink-0">{edu.year}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickStat icon={Code} label="Skills" value={resume.skills.length} color="indigo" />
            <QuickStat icon={Briefcase} label="Roles" value={resume.experience.length} color="emerald" />
            <QuickStat icon={GraduationCap} label="Education" value={resume.education.length} color="amber" />
            <QuickStat icon={Award} label="Certifications" value={resume.certifications.length} color="purple" />
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="space-y-3">
          <SectionCard
            title="Contact Info"
            icon={Globe}
            color="indigo"
            expanded={expandedSection === 'contact'}
            onToggle={() => toggleSection('contact')}
            itemCount={0}
          >
            <p className="text-surface-500 dark:text-slate-400 text-sm">{resume.rawText.split('\n')[0]}</p>
          </SectionCard>

          {resume.experience.length > 0 && (
            <SectionCard
              title="Work Experience"
              icon={Briefcase}
              color="emerald"
              expanded={expandedSection === 'experience'}
              onToggle={() => toggleSection('experience')}
              itemCount={resume.experience.length}
            >
              <div className="space-y-3">
                {resume.experience.map(exp => (
                  <div key={exp.id} className="p-3 bg-surface-100 dark:bg-slate-800/30 rounded-xl">
                    <p className="text-surface-900 dark:text-white font-medium">{exp.role} at {exp.company}</p>
                    <p className="text-surface-400 dark:text-slate-500 text-sm">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</p>
                    <p className="text-surface-500 dark:text-slate-400 text-sm mt-2">{exp.bullets.length} bullet points</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {resume.education.length > 0 && (
            <SectionCard
              title="Education"
              icon={GraduationCap}
              color="amber"
              expanded={expandedSection === 'education'}
              onToggle={() => toggleSection('education')}
              itemCount={resume.education.length}
            >
              {resume.education.map(edu => (
                <div key={edu.id} className="p-3 bg-surface-100 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-surface-900 dark:text-white font-medium">{edu.degree}</p>
                  <p className="text-surface-400 dark:text-slate-500 text-sm">{edu.school} · {edu.year}</p>
                </div>
              ))}
            </SectionCard>
          )}

          {resume.skills.length > 0 && (
            <SectionCard
              title="Skills"
              icon={Code}
              color="purple"
              expanded={expandedSection === 'skills'}
              onToggle={() => toggleSection('skills')}
              itemCount={resume.skills.length}
            >
              <div className="flex flex-wrap gap-2">
                {resume.skills.map(s => (
                  <span key={s} className="px-2 py-1 text-xs bg-surface-100 text-surface-700 dark:bg-slate-800 dark:text-slate-300 rounded-full">{s}</span>
                ))}
              </div>
            </SectionCard>
          )}

          {resume.certifications.length > 0 && (
            <SectionCard
              title="Certifications"
              icon={Award}
              color="rose"
              expanded={expandedSection === 'certs'}
              onToggle={() => toggleSection('certs')}
              itemCount={resume.certifications.length}
            >
              {resume.certifications.map((cert, i) => (
                <p key={i} className="text-surface-600 dark:text-slate-300 text-sm py-1">{cert}</p>
              ))}
            </SectionCard>
          )}

          {resume.projects.length > 0 && (
            <SectionCard
              title="Projects"
              icon={Globe}
              color="cyan"
              expanded={expandedSection === 'projects'}
              onToggle={() => toggleSection('projects')}
              itemCount={resume.projects.length}
            >
              {resume.projects.map(proj => (
                <div key={proj.id} className="p-3 bg-surface-100 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-surface-900 dark:text-white font-medium">{proj.name}</p>
                  <p className="text-surface-500 dark:text-slate-400 text-sm">{proj.description}</p>
                </div>
              ))}
            </SectionCard>
          )}

          {resume.languages.length > 0 && (
            <SectionCard
              title="Languages"
              icon={Languages}
              color="amber"
              expanded={expandedSection === 'languages'}
              onToggle={() => toggleSection('languages')}
              itemCount={resume.languages.length}
            >
              {resume.languages.map((lang, i) => (
                <p key={i} className="text-surface-600 dark:text-slate-300 text-sm py-1">{lang}</p>
              ))}
            </SectionCard>
          )}
        </div>
      )}

      {activeTab === 'ats' && (
        <div className="space-y-6">
          {resume.atsScore !== null && resume.atsBreakdown ? (
            <>
              <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-surface-900 dark:text-white">ATS Score Breakdown</h2>
                </div>

                <div className="text-center mb-8">
                  <div className={cn(
                    'inline-flex items-center justify-center w-28 h-28 rounded-full border-4',
                    resume.atsScore >= 80 ? 'border-emerald-500/30 bg-emerald-500/10' : resume.atsScore >= 60 ? 'border-amber-500/30 bg-amber-500/10' : 'border-rose-500/30 bg-rose-500/10'
                  )}>
                    <span className={cn(
                      'text-4xl font-bold',
                      resume.atsScore >= 80 ? 'text-emerald-400' : resume.atsScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                    )}>
                      {resume.atsScore}
                    </span>
                  </div>
                  <p className="text-surface-500 dark:text-slate-400 text-sm mt-3">
                    {resume.atsScore >= 80 ? 'Great! Your resume is well-optimized for ATS systems.' : resume.atsScore >= 60 ? 'Good start, but there\'s room for improvement.' : 'Your resume needs significant optimization for ATS systems.'}
                  </p>
                </div>

                <div className="space-y-5">
                  <ScoreBar label="Formatting" value={resume.atsBreakdown.formatting} desc="Layout, fonts, and structure" />
                  <ScoreBar label="Keywords" value={resume.atsBreakdown.keywords} desc="Industry-relevant keywords and phrases" />
                  <ScoreBar label="Sections" value={resume.atsBreakdown.sections} desc="Presence and completeness of standard sections" />
                  <ScoreBar label="Readability" value={resume.atsBreakdown.readability} desc="Clear, concise language and grammar" />
                  <ScoreBar label="Contact" value={resume.atsBreakdown.contact} desc="Email, phone, and LinkedIn presence" />
                </div>
              </section>

              {resume.redFlags.length > 0 && (
                <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h2 className="text-lg font-bold text-surface-900 dark:text-white">Red Flags</h2>
                  </div>
                  <div className="space-y-2">
                    {resume.redFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                        <p className="text-surface-600 dark:text-slate-300 text-sm">{flag}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-12 text-center">
              <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Not Analyzed Yet</h2>
              <p className="text-surface-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                This resume hasn't been analyzed by our ATS scanner. Upload a complete resume to get a detailed analysis.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'optimize' && (
        <div className="space-y-6">
          {/* Strengths */}
          {resume.strengths.length > 0 && (
            <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Strengths</h2>
              </div>
              <div className="space-y-2">
                {resume.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-surface-600 dark:text-slate-300 text-sm">{s}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Red Flags */}
          {resume.redFlags.length > 0 && (
            <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Red Flags</h2>
              </div>
              <div className="space-y-2">
                {resume.redFlags.map((flag, i) => (
                  <div key={i} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-surface-600 dark:text-slate-300 text-sm">{flag}</p>
                        <p className="text-surface-400 dark:text-slate-500 text-xs mt-1">
                          {flag.includes('keyword') ? 'Consider adding more industry-specific keywords to improve ATS matching.' :
                           flag.includes('measurable') || flag.includes('metric') ? 'Add quantifiable achievements (%, $, numbers) to each bullet point.' :
                           flag.includes('Gap') ? 'Address the gap by adding context or relevant activities during that period.' :
                           'Review and revise this section for better impact.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Rewrite */}
          <section className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">AI Rewrite</h2>
            </div>

            <button
              onClick={handleRewrite}
              disabled={!isPro || rewriting}
              className={cn(
                'relative p-6 rounded-2xl border text-left transition-all w-full',
                isPro
                  ? 'bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'
                  : 'bg-surface-100 dark:bg-slate-800/30 border-surface-300 dark:border-slate-700 opacity-75 cursor-not-allowed'
              )}
            >
              {!isPro && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Pro
                  </span>
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-surface-900 dark:text-white font-semibold mb-1">AI Rewrite</h3>
              <p className="text-surface-500 dark:text-slate-400 text-sm">
                {isPro ? 'Let AI rewrite your resume for maximum impact' : 'Upgrade to Pro to unlock AI rewriting'}
              </p>
              {rewriting && (
                <div className="flex items-center gap-2 mt-3">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-emerald-400 text-sm">Rewriting...</span>
                </div>
              )}
            </button>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Resume?"
        message="This will permanently delete this resume and all of its associated analyses, roadmaps, and interview sessions. This action cannot be undone."
        confirmLabel="Delete Resume"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  color,
  expanded,
  onToggle,
  itemCount,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  expanded: boolean;
  onToggle: () => void;
  itemCount: number;
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-surface-100 dark:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-surface-900 dark:text-white font-semibold">{title}</span>
          {itemCount > 0 && (
            <span className="text-surface-400 dark:text-slate-500 text-sm">({itemCount})</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-surface-500 dark:text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-surface-500 dark:text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-0 space-y-3 border-t border-surface-200 dark:border-slate-800">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, desc }: { label: string; value: number; desc: string }) {
  const color = value >= 80 ? 'emerald' : value >= 60 ? 'amber' : 'rose';
  const gradientMap = { emerald: 'from-emerald-500 to-emerald-400', amber: 'from-amber-500 to-amber-400', rose: 'from-rose-500 to-rose-400' };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-surface-900 dark:text-white font-medium text-sm">{label}</span>
          <span className="text-surface-400 dark:text-slate-500 text-xs ml-2">{desc}</span>
        </div>
        <span className={cn('text-lg font-bold', color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : 'text-rose-400')}>
          {value}
        </span>
      </div>
      <div className="h-2.5 bg-surface-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradientMap[color]} transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
      <p className="text-surface-400 dark:text-slate-500 text-xs">{label}</p>
    </div>
  );
}
