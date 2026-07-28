'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const plan = searchParams.get('plan') || 'pro';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    const url = new URL(redirect, window.location.origin);
    url.searchParams.set('plan', plan);
    router.push(url.toString());
  };

  const handleOAuth = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const url = new URL(redirect, window.location.origin);
      url.searchParams.set('plan', plan);
      router.push(url.toString());
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-surface-50 dark:bg-slate-950 flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-surface-200 dark:border-slate-800 rounded-3xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-6">
              <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">{plan === 'vip' ? 'VIP Mentorship' : 'Pro Bundle'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-3">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-surface-500 dark:text-slate-400">
              {isSignup
                ? 'Start your career transformation journey'
                : 'Sign in to access your subscription features'}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleOAuth('github')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
            <button
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-surface-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase text-surface-500 dark:text-slate-500">
              <span className="bg-white/80 dark:bg-slate-900/80 px-4 backdrop-blur-xl">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-500 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-500 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 dark:text-slate-500 hover:text-surface-900 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || password.length < 6}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="text-center text-surface-500 dark:text-slate-500 text-sm mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary-400 hover:text-primary-300 font-medium underline"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <p className="text-center text-surface-500 dark:text-slate-500 text-xs mt-4">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-surface-700 dark:hover:text-slate-300">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-surface-700 dark:hover:text-slate-300">Privacy Policy</a>
          </p>
        </div>

        <div className="text-center mt-6 text-surface-500 dark:text-slate-500 text-sm">
          <p>Demo mode — any credentials work</p>
        </div>
      </div>
    </main>
  );
}