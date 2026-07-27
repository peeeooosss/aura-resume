'use client';

import { cn } from '@/lib/utils/helpers';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ReactNode } from 'react';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}