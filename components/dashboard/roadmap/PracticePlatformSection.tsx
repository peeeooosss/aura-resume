'use client';

import { ExternalLink, MousePointerClick, Layers } from 'lucide-react';
import type { PhasePracticePlatform } from '@/lib/types/roadmap';

export function PracticePlatformSection({ platforms }: { platforms: PhasePracticePlatform[] }) {
  if (!platforms || platforms.length === 0) {
    return (
      <div className="text-center py-12 text-surface-400 dark:text-slate-500">
        <Layers className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No practice platforms for this phase yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-surface-500 dark:text-slate-400 text-sm mb-4">
        Hands-on platforms to practice and apply the skills you're building this phase.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform, i) => (
          <a
            key={i}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col p-4 bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-xl hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-semibold text-surface-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                {platform.name}
              </span>
            </div>
            <p className="text-surface-600 dark:text-slate-300 text-xs flex-1 line-clamp-3">
              {platform.description}
            </p>
            <span className="flex items-center gap-1 mt-3 text-xs text-indigo-400">
              <ExternalLink className="w-3 h-3" />
              Open platform
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
