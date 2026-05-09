'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Heart, Calendar, Loader2 } from 'lucide-react';
import { worksApi } from '@/lib/api';
import { VIDEO_CATEGORY_LABELS, type Work } from '@/types';

export default function WorkDetailPage() {
  const params = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWork() {
      try {
        const res = await worksApi.detail(params.id as string) as any;
        setWork(res);
      } catch {
        setWork(null);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchWork();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-gray-500">作品不存在</p>
        <Link href="/works" className="mt-4 inline-block text-primary-500 hover:underline">返回作品列表</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/works" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回作品列表
      </Link>

      <div className="card overflow-hidden">
        {/* Video Player */}
        <div className="aspect-video bg-black">
          <video
            src={work.videoUrl}
            controls
            autoPlay
            className="h-full w-full"
            poster={work.coverUrl}
          >
            您的浏览器不支持视频播放
          </video>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{work.title}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                  {VIDEO_CATEGORY_LABELS[work.category]}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(work.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>

          {/* Creator */}
          {work.creator && (
            <div className="mt-5 flex items-center gap-3 border-t border-primary-100 pt-5">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{work.creator.nickname}</p>
                <p className="text-xs text-gray-500">创作者</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {work.tags && work.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {work.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-600 ring-1 ring-purple-200">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-5 flex items-center gap-6 border-t border-primary-100 pt-5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {work.viewCount.toLocaleString()} 次观看
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {work.likeCount.toLocaleString()} 次点赞
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
