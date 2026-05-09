'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Loader2, Eye, Heart, MessageSquare } from 'lucide-react';
import { creatorApi, reviewApi } from '@/lib/api';
import { VIDEO_CATEGORY_LABELS, type Work } from '@/types';
import { ReviewList } from '@/components/ui/ReviewList';
import { cn } from '@/lib/utils';

interface Creator {
  userId: string;
  bio: string;
  tags: string[];
  aiTools: string[];
  priceMin: number;
  priceMax: number;
  status: string;
  rating: number;
  orderCount: number;
  user: { id: string; nickname: string; avatar: string; createdAt: string };
  works: Work[];
}

export default function CreatorDetailPage() {
  const params = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [creatorRes, reviewsRes] = await Promise.allSettled([
          creatorApi.detail(params.id as string),
          reviewApi.list({ targetId: params.id as string, page: 1, pageSize: 20 }),
        ]);
        if (creatorRes.status === 'fulfilled') setCreator(creatorRes.value as any as Creator);
        if (reviewsRes.status === 'fulfilled') setReviews((reviewsRes.value as any)?.items || []);
      } catch {
        setCreator(null);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-gray-500">创作者不存在</p>
        <Link href="/creators" className="mt-4 inline-block text-primary-500 hover:underline">返回创作者列表</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/creators" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回创作者列表
      </Link>

      {/* Profile Header */}
      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 text-3xl font-bold text-white shadow-xl ring-4 ring-white">
              {creator.user.nickname[0]}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-gray-900">{creator.user.nickname}</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-700">{creator.rating}</span>
                </div>
                <span className="text-sm text-gray-400">{creator.orderCount} 单完成</span>
                <span className={cn(
                  'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                  creator.status === 'ONLINE' ? 'bg-green-100 text-green-700' :
                  creator.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                )}>
                  {creator.status === 'ONLINE' ? '在线接单' : creator.status === 'BUSY' ? '忙碌' : '离线'}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">{creator.bio}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {creator.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {creator.aiTools.map((tool) => (
              <span key={tool} className="rounded bg-purple-50 px-2.5 py-1 text-xs text-purple-600 ring-1 ring-purple-200">
                {tool}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-6 border-t border-primary-100 pt-5">
            <div>
              <p className="text-xs text-gray-400">报价范围</p>
              <p className="text-lg font-semibold text-primary-600">¥{creator.priceMin} - ¥{creator.priceMax}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">入驻时间</p>
              <p className="text-sm text-gray-700">{new Date(creator.user.createdAt).toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Works */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">作品集</h2>
        {creator.works.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creator.works.map((work) => (
              <Link key={work.id} href={`/works/${work.id}`} className="card-hover group overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 overflow-hidden">
                  {work.coverUrl ? (
                    <img src={work.coverUrl} alt={work.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">{work.title}</h3>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{work.viewCount.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{work.likeCount.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">暂无作品</p>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">客户评价</h2>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
