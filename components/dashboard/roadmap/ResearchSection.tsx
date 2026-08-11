'use client';

import { useState } from 'react';
import { ExternalLink, BookOpen, Code2, FileText, Link2, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PhaseResearchResource } from '@/lib/types/roadmap';

const typeIcon = {
  article: BookOpen,
  docs: FileText,
  repo: Code2,
  tool: Link2,
};

const typeColor = {
  article: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  docs: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  repo: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  tool: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

function ResourceCard({ resource }: { resource: PhaseResearchResource }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcon[resource.type];

  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center border', typeColor[resource.type])}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white text-sm line-clamp-1">{resource.title}</h4>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block capitalize', typeColor[resource.type])}>
              {resource.type}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-surface-400" /> : <ChevronDown className="w-5 h-5 text-surface-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-200 dark:border-slate-800 space-y-3 pt-3">
          <p className="text-surface-600 dark:text-slate-300 text-sm">{resource.description}</p>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
          >
            <ExternalLink className="w-3 h-3" />
            Open resource
          </a>
        </div>
      )}
    </div>
  );
}

export function ResearchSection({ resources }: { resources: PhaseResearchResource[] }) {
  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-12 text-surface-400 dark:text-slate-500">
        <Layers className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No research resources for this phase yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-surface-500 dark:text-slate-400 text-sm">
        Curated articles, docs, repos, and tools to deepen your learning in this phase.
      </p>
      {resources.map((resource, i) => (
        <ResourceCard key={i} resource={resource} />
      ))}
    </div>
  );
}
