'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowLeft, CreditCard, Lock, CheckCircle, Loader2, User } from 'lucide-react';
import { usePlan } from '@/lib/hooks/usePlan';
import { useCreditsStore } from '@/lib/hooks/useCredits';
import { useAuth } from '@/lib/hooks/useAuth';
import { loadRazorpayScript } from '@/lib/payment/checkout';
import { readJsonResponse } from '@/lib/utils/helpers';
import { getPlanBySlug } from '@/lib/constants/plans';

const PLAN_FEATURES: Record<string, string[]> = {
  'quick-fix': ['Full ATS scan', 'Red flag details & fixes', 'ATS-optimized resume download', 'PDF report'],
  'pro-bundle': ['AI resume rewrite', 'Cover letters', 'LinkedIn review', 'Portfolio builder'],
  'vip-mentorship': ['Everything in Pro', '1-on-1 mentoring', 'Salary coaching', 'Unlimited support'],
};

export default function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get('plan') || 'quick-fix';
  const resultId = searchParams.get('resultId');

  const { user, authenticated, loading: authLoading } = useAuth();

  const planDef = getPlanBySlug(rawPlan) || getPlanBySlug('quick-fix')!;
  const plan = {
    slug: planDef.slug,
    planId: planDef.id,
    name: planDef.name,
    price: planDef.price,
    period: planDef.period,
    features: PLAN_FEATURES[planDef.slug] || [],
  };

  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const startedRef = useRef(false);

  const runCheckout = useCallback(async () => {
    setLoading(true);
    setError('');

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Failed to load payment gateway. Please refresh and try again.');
      setLoading(false);
      return;
    }

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.slug }),
      });

      const orderData = await readJsonResponse(orderRes);
      const { orderId, amount, currency, keyId } = orderData;

      let storedResumeText = '';
      let storedAnalysis: any = null;
      let storedFileName = '';

      if (resultId) {
        try {
          const stored = sessionStorage.getItem(`aura-result-${resultId}`);
          if (stored) {
            const data = JSON.parse(stored);
            storedResumeText = data.resume?.originalText || '';
            storedAnalysis = data.resume;
            storedFileName = data.resume?.fileName || '';
          }
        } catch {}

        if (!storedResumeText) {
          try {
            const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
            if (analyses[resultId]) {
              storedResumeText = analyses[resultId].resume?.originalText || '';
              storedAnalysis = analyses[resultId].resume;
            }
          } catch {}
        }
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Aura Resume',
        description: `${plan.name} — ₹${plan.price}`,
        order_id: orderId,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#6366f1' },
        handler: async (response: any) => {
          setStep('processing');
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                ...(storedResumeText ? {
                  resumeText: storedResumeText,
                  analysis: storedAnalysis,
                  fileName: storedFileName,
                } : {}),
              }),
            });

            const verifyData = await readJsonResponse(verifyRes);

            if (storedResumeText && resultId) {
              try {
                const analyses = JSON.parse(localStorage.getItem('aura-analyses') || '{}');
                if (analyses[resultId]) {
                  analyses[resultId].unlockedTier = plan.planId;
                  analyses[resultId].purchasedAt = new Date().toISOString();
                  if (verifyData.optimizedResume) {
                    analyses[resultId].optimizedResumeText = verifyData.optimizedResume;
                  }
                  localStorage.setItem('aura-analyses', JSON.stringify(analyses));
                }
                localStorage.setItem(`aura-unlocked-${resultId}`, JSON.stringify({
                  tier: plan.planId,
                  at: Date.now(),
                }));
              } catch {}
            }

            setResumeId(verifyData.resumeId || null);
            usePlan.getState().setPlan(plan.planId as any);
            useCreditsStore.getState().refresh();
            setLoading(false);
            setStep('success');
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setLoading(false);
            setStep('details');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setError(resp.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  }, [plan, resultId, user?.name, user?.email]);

  useEffect(() => {
    if (authLoading) return;
    if (!authenticated) {
      const redirect = `/payment?plan=${plan.slug}${resultId ? `&resultId=${encodeURIComponent(resultId)}` : ''}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    if (!startedRef.current) {
      startedRef.current = true;
      runCheckout();
    }
  }, [authLoading, authenticated, plan.slug, resultId, runCheckout, router]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Checking your account...</p>
      </main>
    );
  }

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
            <p className="text-slate-400 mb-6">Your {plan.name} plan is now active.</p>
            <button
              onClick={() => {
                if (resumeId) {
                  router.push(`/dashboard/resumes/${resumeId}/report`);
                } else if (resultId) {
                  router.push(`/report/${resultId}?unlocked=true`);
                } else {
                  router.push('/dashboard');
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
              <span className="text-sm text-emerald-300 font-medium">Secure Payment via Razorpay</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Complete Your Purchase</h1>
            <p className="text-slate-400">
              {plan.name} — <span className="text-white font-semibold">₹{plan.price}</span> {plan.period}
            </p>
          </div>

          <div className="space-y-4 mb-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            {plan.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {user && (
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name || 'Account'}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center mb-6">
              {error}
            </div>
          )}

          <button
            onClick={runCheckout}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Opening Razorpay...</>
            ) : (
              `Pay ₹${plan.price} Securely`
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-center mt-6">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">SSL encrypted • Secure Razorpay checkout</span>
          </div>
        </div>
      </div>
    </main>
  );
}
