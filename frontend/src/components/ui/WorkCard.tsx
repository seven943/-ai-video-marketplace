'use client';

import Link from 'next/link';
import { Eye, Heart, Play } from 'lucide-react';
import type { Work } from '@/types';
import { VIDEO_CATEGORY_LABELS } from '@/types';
import { Badge } from './Badge';

interface WorkCardProps {
  work: Work;
}

const gradients = [
  'from-violet-400 to-purple-500',
  'from-fuchsia-400 to-pink-500',
  'from-purple-400 to-indigo-500',
  'from-rose-400 to-fuchsia-500',
  'from-indigo-400 to-violet-500',
  'from-pink-400 to-rose-500',
];

function getGradient(id: string) {
  const idx = id.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export function WorkCard({ work }: WorkCardProps) {
  return (
    <Link href={`/works/${work.id}`} className="group card-hover overflow-hidden">
      {/* Cover */}
      <div className={`relative aspect-video overflow-hidden bg-gradient-to-br ${getGradient(work.id)}`}>
        {work.coverUrl ? (
          <img
            src={work.coverUrl}
            alt={work.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-12 w-12 text-white/40" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 text-primary-600 ml-0.5" />
          </div>
        </div>
        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <Badge variant="primary" className="backdrop-blur-sm bg-primary-100/80">
            {VIDEO_CATEGORY_LABELS[work.category]}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {work.title}
        </h3>

        {/* Creator */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400" />
          <span className="text-xs text-gray-500">{work.creator?.nickname || '创作者'}</span>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {work.viewCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {work.likeCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
