'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Loader2, Eye, Heart, MessageSquare, Briefcase, ExternalLink, TrendingUp, CheckCircle, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { creatorApi, reviewApi, chatApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { VIDEO_CATEGORY_LABELS, type Work } from '@/types';
import { ReviewList } from '@/components/ui/ReviewList';
import { cn } from '@/lib/utils';

interface Creator {
  userId: string;
  bio: string;
  tags: string[];
  portfolioUrls: string[];
  aiTools: string[];
  priceMin: number;
  priceMax: number;
  status: string;
  rating: number;
  orderCount: number;
  user: { id: string; nickname: string; avatar: string; createdAt: string };
  works: Work[];
  stats: {
    totalViews: number;
    totalLikes: number;
    totalWorks: number;
    completedOrders: number;
  };
}

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [contacting, setContacting] = useState(false);
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
        toast.error('加载创作者信息失败');
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

  const statusLabel = creator.status === 'ONLINE' ? '在线接单' : creator.status === 'BUSY' ? '忙碌' : '离线';
  const statusColor = creator.status === 'ONLINE' ? 'bg-green-100 text-green-700' : creator.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/creators" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回创作者列表
      </Link>

      {/* Profile Header */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400" />
        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-5">
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 text-4xl font-bold text-white shadow-xl ring-4 ring-white">
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
                  <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', statusColor)}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {user?.id === creator.userId && (
                <Link
                  href="/creators/edit"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  编辑资料
                </Link>
              )}
              <button
                onClick={async () => {
                  if (!user) {
                    toast.error('请先登录');
                    return;
                  }
                  setContacting(true);
                  try {
                    const conv = await chatApi.getOrCreateDirect(creator.userId) as any;
                    router.push(`/chat/${conv.id}`);
                  } catch (err: any) {
                    toast.error(err.message || '联系失败');
                  } finally {
                    setContacting(false);
                  }
                }}
                disabled={contacting}
                className="btn-primary flex items-center gap-2"
              >
                {contacting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                找我下单
              </button>
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

          <div className="mt-3 flex flex-wrap gap-2">
            {creator.aiTools.map((tool) => (
              <span key={tool} className="rounded bg-purple-50 px-2.5 py-1 text-xs text-purple-600 ring-1 ring-purple-200">
                {tool}
              </span>
            ))}
          </div>

          {/* 作品集链接 */}
          {creator.portfolioUrls && creator.portfolioUrls.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {creator.portfolioUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  作品集 {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 数据统计 */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Eye className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{(creator.stats?.totalViews || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">总播放量</p>
        </div>
        <div className="card p-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-pink-50">
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{(creator.stats?.totalLikes || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">总点赞数</p>
        </div>
        <div className="card p-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{creator.stats?.totalWorks || 0}</p>
          <p className="text-xs text-gray-500">作品数量</p>
        </div>
        <div className="card p-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{creator.stats?.completedOrders || 0}</p>
          <p className="text-xs text-gray-500">完成订单</p>
        </div>
      </div>

      {/* 报价与入驻信息 */}
      <div className="mt-6 card p-5">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-xs text-gray-400">报价范围</p>
            <p className="text-lg font-semibold text-primary-600">¥{creator.priceMin} - ¥{creator.priceMax}</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400">入驻时间</p>
            <p className="text-sm text-gray-700">{new Date(creator.user.createdAt).toLocaleDateString('zh-CN')}</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400">综合评分</p>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold text-gray-900">{creator.rating}</span>
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
