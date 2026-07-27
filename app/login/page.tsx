import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Loading login form...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}