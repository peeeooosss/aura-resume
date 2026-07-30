'use client';

import { useState, useEffect } from 'react';
import { Mail, Copy, Check, Loader2, Lightbulb } from 'lucide-react';
import { useCredits } from '@/lib/hooks/useCredits';
import { CREDIT_COSTS } from '@/lib/constants/credits';

interface Resume {
  id: string;
  title: string;
  rawText?: string | null;
  createdAt: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  tips: string[];
}

type EmailType = 'networking' | 'referral' | 'inquiry';

export function ColdEmailPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [emailType, setEmailType] = useState<EmailType>('networking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const { balance, refresh: refreshCredits } = useCredits();

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await fetch('/api/resumes');
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    }
  }

  async function handleGenerate() {
    if (!selectedResumeId || !targetCompany.trim() || !targetRole.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (balance < CREDIT_COSTS.cold_email) {
      setError(`Insufficient credits. You need ${CREDIT_COSTS.cold_email} credits but have ${balance}.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          targetCompany: targetCompany.trim(),
          targetRole: targetRole.trim(),
          emailType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setGeneratedEmail({
        subject: data.subject,
        body: data.body,
        tips: data.tips || [],
      });

      refreshCredits();
    } catch (err: any) {
      setError(err.message || 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string, type: 'subject' | 'body') {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'subject') {
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function handleReset() {
    setGeneratedEmail(null);
    setTargetCompany('');
    setTargetRole('');
    setEmailType('networking');
  }

  const emailTypeLabels: Record<EmailType, string> = {
    networking: 'Networking',
    referral: 'Referral Request',
    inquiry: 'Job Inquiry',
  };

  if (generatedEmail) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Generated Cold Email</h2>
          </div>
          <p className="text-sm text-surface-500 dark:text-slate-400 mb-4">
            {emailTypeLabels[emailType]} for {targetRole} at {targetCompany}
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-surface-500 dark:text-slate-400">Subject</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 p-3 bg-surface-100 dark:bg-slate-800 rounded-lg text-sm text-surface-900 dark:text-white">{generatedEmail.subject}</div>
                <button
                  onClick={() => copyToClipboard(generatedEmail.subject, 'subject')}
                  className="p-2 hover:bg-surface-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {copiedSubject ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-surface-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-surface-500 dark:text-slate-400">Email Body</label>
              <div className="relative mt-1">
                <div className="p-4 bg-surface-100 dark:bg-slate-800 rounded-lg text-sm whitespace-pre-wrap leading-relaxed text-surface-900 dark:text-white">
                  {generatedEmail.body}
                </div>
                <button
                  onClick={() => copyToClipboard(generatedEmail.body, 'body')}
                  className="absolute top-2 right-2 p-2 hover:bg-surface-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {copiedBody ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-surface-400" />}
                </button>
              </div>
            </div>

            {generatedEmail.tips.length > 0 && (
              <div>
                <label className="text-sm font-medium text-surface-500 dark:text-slate-400 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" /> Tips
                </label>
                <ul className="mt-2 space-y-1">
                  {generatedEmail.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-surface-500 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-surface-300 dark:border-slate-700 rounded-lg text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-800 transition-colors"
              >
                Generate Another
              </button>
              <button
                onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Copy Full Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Cold Email Generator</h2>
        </div>
        <p className="text-sm text-surface-500 dark:text-slate-400 mb-4">
          Generate personalized cold outreach emails for networking, referrals, and job inquiries
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-surface-500 dark:text-slate-400">Select Resume</label>
            <div className="grid gap-3 mt-2 sm:grid-cols-2">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => setSelectedResumeId(resume.id)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all hover:border-purple-500 ${
                    selectedResumeId === resume.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-surface-300 dark:border-slate-700'
                  }`}
                >
                  <p className="text-sm font-medium truncate text-surface-900 dark:text-white">{resume.title}</p>
                  <p className="text-xs text-surface-400 dark:text-slate-500 mt-1">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-surface-500 dark:text-slate-400">Target Company</label>
              <input
                type="text"
                placeholder="e.g., Google, Stripe, Notion"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-lg text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500 dark:text-slate-400">Target Role</label>
              <input
                type="text"
                placeholder="e.g., Senior Software Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-lg text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-surface-500 dark:text-slate-400">Email Type</label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value as EmailType)}
              className="w-full mt-1 px-3 py-2 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-lg text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="networking">Networking</option>
              <option value="referral">Referral Request</option>
              <option value="inquiry">Job Inquiry</option>
            </select>
          </div>

          {error && (
            <div className="p-3 text-sm text-rose-400 bg-rose-500/10 rounded-lg">{error}</div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-purple-400 border border-purple-500/30 px-2 py-1 rounded">
              {CREDIT_COSTS.cold_email} credits
            </span>
            <button
              onClick={handleGenerate}
              disabled={!selectedResumeId || !targetCompany.trim() || !targetRole.trim() || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Generate Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

