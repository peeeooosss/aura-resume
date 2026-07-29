'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, AtSign, ArrowRight, Loader2, Check, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session, status, router]);

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const res = await fetch(`/api/onboarding?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username || usernameStatus !== 'available') return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save profile');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-50 dark:bg-slate-950 flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.1),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-surface-200 dark:border-slate-800 rounded-3xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">Welcome to Aura</h1>
            <p className="text-surface-500 dark:text-slate-400">
              Set up your profile to get started
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-500 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
                Choose a Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  className={cn(
                    'w-full pl-12 pr-12 py-3 bg-surface-100 dark:bg-slate-800 border rounded-xl text-surface-900 dark:text-white placeholder-surface-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all',
                    usernameStatus === 'available' ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20' :
                    usernameStatus === 'taken' ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' :
                    'border-surface-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                  )}
                  placeholder="johndoe"
                  disabled={loading}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 text-surface-400 animate-spin" />}
                  {usernameStatus === 'available' && <Check className="w-4 h-4 text-emerald-400" />}
                  {usernameStatus === 'taken' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                  {usernameStatus === 'invalid' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-surface-500 dark:text-slate-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
              {usernameStatus === 'taken' && (
                <p className="mt-1 text-xs text-rose-400">This username is already taken</p>
              )}
              {usernameStatus === 'invalid' && (
                <p className="mt-1 text-xs text-amber-400">Only letters, numbers, and underscores allowed</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !username || usernameStatus !== 'available'}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
