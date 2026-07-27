'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Check, CreditCard, Banknote, Smartphone, Zap } from 'lucide-react';

export default function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'quick-fix';
  const fromResults = searchParams.get('id') !== null;

  const [method, setMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const plans = {
    'quick-fix': { name: 'Quick Fix', price: 49, period: 'one-time', icon: Zap, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    'pro': { name: 'Pro Bundle', price: 499, period: '/3 months', icon: Check, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
    'vip': { name: 'VIP Mentorship', price: 1499, period: '/3 months', icon: Check, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  };

  const currentPlan = plans[plan as keyof typeof plans] || plans['quick-fix'];

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => {
      if (fromResults) {
        router.push('/results?test=true&unlocked=true');
      } else {
        router.push('/dashboard');
      }
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {!success && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-10">
          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-slate-400 mb-8">Your {currentPlan.name} is now active. Redirecting...</p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentPlan.bgColor} border border-indigo-500/20 mb-6`}>
                  <currentPlan.icon className={`w-4 h-4 ${currentPlan.color}`} />
                  <span className="text-sm font-medium text-indigo-300">{currentPlan.name}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Complete Your Payment</h1>
                <p className="text-slate-400">Secure checkout — encrypted & safe</p>
              </div>

              <div className={`bg-${currentPlan.color.replace('text-', 'bg-').replace('400', '500/10')} border border-indigo-500/20 rounded-2xl p-6 mb-8 text-center`}>
                <span className="text-5xl font-bold text-white">₹{currentPlan.price}</span>
                <span className="text-slate-500 text-sm ml-2">{currentPlan.period}</span>
                {plan !== 'quick-fix' && (
                  <div className="mt-2 text-xs text-slate-500">
                    ~₹{Math.round(currentPlan.price / 3)}/month
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <label className="block text-sm font-medium text-slate-300">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['card', 'upi', 'wallet'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        method === m
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {m === 'card' && <CreditCard className="w-6 h-6 mx-auto mb-2" />}
                      {m === 'upi' && <Smartphone className="w-6 h-6 mx-auto mb-2" />}
                      {m === 'wallet' && <Banknote className="w-6 h-6 mx-auto mb-2" />}
                      <span className="text-xs font-medium block text-center capitalize">{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              {method === 'card' && (
                <div className="space-y-4 mb-8 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'upi' && (
                <div className="mb-8 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <label className="block text-sm text-slate-400 mb-2">UPI ID</label>
                  <input
                    type="text"
                    placeholder="name@paytm / name@okhdfcbank"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {method === 'wallet' && (
                <div className="mb-8 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm text-center">You will be redirected to your wallet app to complete payment</p>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${currentPlan.price} Securely`
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5" />
                <span>Secured by Razorpay · 128-bit SSL encryption</span>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-slate-500 text-sm">
          <p>Demo mode — click "Pay" to simulate success</p>
        </div>
      </div>
    </main>
  );
}