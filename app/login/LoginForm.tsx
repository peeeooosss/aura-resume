'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Chrome, User, AtSign, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam || '');
  const [isSignup, setIsSignup] = useState(false);

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
    setLoading(true);
    setError('');

    if (isSignup) {
      if (!name.trim() || !username || usernameStatus !== 'available') {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name.trim(), username }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to create account');
          setLoading(false);
          return;
        }
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (signInResult?.error) {
          setError('Account created but sign-in failed. Please try signing in.');
          setIsSignup(false);
        } else {
          router.push(redirect);
        }
      } catch {
        setError('Network error. Please try again.');
      }
      setLoading(false);
    } else {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push(redirect);
      }
    }
  };

  const handleOAuth = async (provider: 'google') => {
    setLoading(true);
    setError('');
    await signIn(provider, { callbackUrl: redirect });
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
            <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-3">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-surface-500 dark:text-slate-400">
              {isSignup
                ? 'Start your career transformation journey'
                : 'Sign in to access your resume dashboard'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
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
            {isSignup && (
              <>
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-500" />
                    <input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-surface-100 dark:bg-slate-800 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-500 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-username" className="block text-sm font-medium text-surface-600 dark:text-slate-300 mb-2">
                    Choose a Username
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 dark:text-slate-500" />
                    <input
                      id="signup-username"
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
              </>
            )}

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
              disabled={loading || !email || password.length < 6 || (isSignup && (!name.trim() || !username || usernameStatus !== 'available'))}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="text-center text-surface-500 dark:text-slate-500 text-sm mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
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
      </div>
    </main>
  );
}
