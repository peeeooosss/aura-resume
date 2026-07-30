'use client';

import { Play, ExternalLink } from 'lucide-react';
import type { PhaseVideo } from '@/lib/types/roadmap';

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

export function VideoSection({ videos }: { videos: PhaseVideo[] }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12 text-surface-400 dark:text-slate-500">
        <Play className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No videos available for this phase yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-surface-500 dark:text-slate-400 text-sm mb-4">
        Curated videos to help you master this phase's topics.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {videos.map((video, i) => {
          const ytId = getYouTubeId(video.url);
          return (
            <a
              key={i}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all"
            >
              {ytId ? (
                <div className="relative aspect-video bg-slate-800">
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-slate-800 flex items-center justify-center">
                  <Play className="w-10 h-10 text-slate-500" />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold text-surface-900 dark:text-white text-sm group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {video.title}
                </h4>
                {video.description && (
                  <p className="text-surface-400 dark:text-slate-500 text-xs mt-1 line-clamp-2">{video.description}</p>
                )}
                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-400">
                  <ExternalLink className="w-3 h-3" />
                  Watch on YouTube
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
