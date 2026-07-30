'use client';

import { useState } from 'react';
import { Folder, ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PhaseProject } from '@/lib/types/roadmap';

const difficultyColor = {
  beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

function ProjectCard({ project }: { project: PhaseProject }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Folder className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white text-sm">{project.name}</h4>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block', difficultyColor[project.difficulty])}>
              {project.difficulty}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-surface-400" /> : <ChevronDown className="w-5 h-5 text-surface-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-surface-200 dark:border-slate-800 space-y-4">
          <p className="text-surface-600 dark:text-slate-300 text-sm pt-4">{project.description}</p>

          {project.techStack?.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-surface-400 dark:text-slate-500 uppercase tracking-wide mb-2">Tech Stack</h5>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.deliverables?.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-surface-400 dark:text-slate-500 uppercase tracking-wide mb-2">Deliverables</h5>
              <div className="space-y-1.5">
                {project.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-surface-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.steps?.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-surface-400 dark:text-slate-500 uppercase tracking-wide mb-2">Steps</h5>
              <div className="space-y-2">
                {project.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-surface-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-surface-500 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-surface-600 dark:text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectSection({ projects }: { projects: PhaseProject[] }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 text-surface-400 dark:text-slate-500">
        <Layers className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No projects available for this phase yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-surface-500 dark:text-slate-400 text-sm">
        Build these projects to apply what you've learned in this phase.
      </p>
      {projects.map((project, i) => (
        <ProjectCard key={i} project={project} />
      ))}
    </div>
  );
}
