'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, CheckCircle } from 'lucide-react';

export default function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'quick-fix';
  const resultId = searchParams.get('resultId');

  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const planConfig =
    plan === 'quick-fix'
      ? { name: 'Quick Fix', price: 49, period: 'one-time', features: ['Full ATS scan', 'Red flag details', 'PDF report'] }
      : plan === 'vip-mentorship'
      ? { name: 'VIP Mentorship', price: 1499, period: '/3 months', features: ['Everything in Pro', '1-on-1 mentoring', 'Salary coaching', 'Unlimited support'] }
      : { name: 'Pro Bundle', price: 499, period: '/3 months', features: ['AI resume rewrite', 'Cover letters', 'LinkedIn review', 'Portfolio builder'] };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setLoading(true);
    setStep('processing');
    await new Promise(r => setTimeout(r, 2500));
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-slate-400 mb-6">Your {planConfig.name} is now active. Check your email for the PDF report.</p>
            <button
              onClick={() => {
                if (resultId) {
                  const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
                  if (analyses[resultId]) {
                    analyses[resultId].unlockedTier = plan === 'vip-mentorship' ? 'vip' : plan === 'quick-fix' ? 'quick' : 'pro';
                    localStorage.setItem('aura-analyses', JSON.stringify(analyses));
                  }
                  localStorage.setItem(`aura-unlocked-${resultId}`, JSON.stringify({ tier: plan === 'vip-mentorship' ? 'vip' : plan === 'quick-fix' ? 'quick' : 'pro', at: Date.now() }));
                  router.push(`/report/${resultId}`);
                } else {
                  router.push('/results?test=true');
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              View Your Report
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Secure Payment</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Complete Your Purchase</h1>
            <p className="text-slate-400">
              {planConfig.name} — <span className="text-white font-semibold">₹{planConfig.price}</span> {planConfig.period}
            </p>
          </div>

          <div className="space-y-4 mb-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            {planConfig.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <CreditCard className="w-6 h-6 text-slate-400" />
              <span className="text-sm text-slate-300">Card / UPI / Net Banking via Razorpay</span>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !name}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay ₹${planConfig.price} Securely`}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-center mt-6">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">SSL encrypted • 30-day money-back guarantee</span>
          </div>
        </div>

        <div className="text-center mt-6 text-slate-500 text-sm">
          <p>Demo mode — no real payment processed</p>
        </div>
      </div>
    </main>
  );
}