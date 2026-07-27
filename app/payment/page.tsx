import { Suspense } from 'react';
import PaymentForm from './PaymentForm';

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Loading payment details...</p>
      </div>
    }>
      <PaymentForm />
    </Suspense>
  );
}