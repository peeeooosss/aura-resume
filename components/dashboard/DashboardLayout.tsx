'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/helpers';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastProvider } from '@/components/ui/Toast';
import { ReactNode } from 'react';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (session?.user && !(session.user as any).onboarded && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [session, status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const user = session?.user as any;
  if (user && !user.onboarded && pathname !== '/onboarding') return null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface-50 dark:bg-slate-950 flex">
        <Sidebar />
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
