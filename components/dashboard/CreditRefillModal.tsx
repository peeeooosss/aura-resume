'use client';

import { useState } from 'react';
import { Coins, X, Check, Loader2, Lock, Zap } from 'lucide-react';
import { getRefillOptions, REFILL_THRESHOLD } from '@/lib/constants/credits';
import { useCredits } from '@/lib/hooks/useCredits';
import { loadRazorpayScript } from '@/lib/payment/checkout';
import { readJsonResponse } from '@/lib/utils/helpers';

interface CreditRefillModalProps {
  open: boolean;
  onClose: () => void;
  plan: string;
}

export function CreditRefillModal({ open, onClose, plan }: CreditRefillModalProps) {
  const { balance, refresh } = useCredits();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const options = getRefillOptions(plan);
  const canRefill = plan !== 'free';

  async function handleRefill(amount: number) {
    if (!canRefill) return;
    setLoading(String(amount));
    setError(null);
    setSuccess(null);

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'refill', credits: amount }),
      });
      const orderData = await readJsonResponse(orderRes);
      const { orderId, amount: orderAmount, currency, keyId } = orderData;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Failed to load payment gateway. Please refresh and try again.');

      const options = {
        key: keyId,
        amount: orderAmount,
        currency,
        name: 'Aura Resume',
        description: `Credit refill — ${amount} credits`,
        order_id: orderId,
        theme: { color: '#f59e0b' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            await readJsonResponse(verifyRes);
            await refresh();
            setSuccess(`+${amount} credits added!`);
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
          } finally {
            setLoading(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setError(resp.error?.description || 'Payment failed. Please try again.');
        setLoading(null);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Refill failed');
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-surface-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="font-bold text-surface-900 dark:text-white">Refill Credits</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-500 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-100 dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-surface-500 dark:text-slate-400">Current Balance</span>
            </div>
            <span className={`font-bold text-lg ${balance <= REFILL_THRESHOLD ? 'text-rose-500' : 'text-surface-900 dark:text-white'}`}>
              {balance} credits
            </span>
          </div>

          {canRefill ? (
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => handleRefill(option.amount)}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-surface-300 dark:border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-surface-900 dark:text-white">{option.amount} credits</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {loading === String(option.amount) && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
                    <span className="font-bold text-surface-900 dark:text-white">₹{option.price}</span>
                  </span>
                </button>
              ))}
              <p className="text-xs text-surface-400 dark:text-slate-500 text-center">
                Instant top-up · credited immediately after payment
              </p>
            </div>
          ) : (
            <div className="text-center p-6 rounded-2xl bg-surface-100 dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700">
              <Lock className="w-8 h-8 text-surface-400 dark:text-slate-500 mx-auto mb-3" />
              <p className="font-semibold text-surface-900 dark:text-white mb-1">Refills are for paid plans</p>
              <p className="text-sm text-surface-500 dark:text-slate-400">
                Upgrade to Pro (₹499) or VIP (₹1,499) to refill credits when you run low.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              {success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
