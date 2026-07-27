'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Github, Chrome } from 'lucide-react';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/plans';
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
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 mb-6">
              <span className="text-sm text-indigo-300 font-medium">{plan === 'vip' ? 'VIP Mentorship' : 'Pro Bundle'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-slate-400">
              {isSignup
                ? 'Start your career transformation journey'
                : 'Sign in to access your subscription features'}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleOAuth('github')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
            <button
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase text-slate-500">
              <span className="bg-slate-900/80 px-4 backdrop-blur-xl">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || password.length < 6}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <p className="text-center text-slate-600 text-xs mt-4">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-slate-400">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-slate-400">Privacy Policy</a>
          </p>
        </div>

        <div className="text-center mt-6 text-slate-500 text-sm">
          <p>Demo mode — any credentials work</p>
        </div>
      </div>
    </main>
  );
}