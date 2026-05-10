'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Loader2, Sparkles, Eye, Briefcase } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface RecommendedCreator {
  userId: string;
  bio: string;
  tags: string[];
  aiTools: string[];
  priceMin: number;
  priceMax: number;
  status: string;
  rating: number;
  orderCount: number;
  user: { id: string; nickname: string; avatar: string };
  matchScore: number;
  matchReasons: string[];
}

interface RecommendedCreatorsProps {
  orderId: string;
  compact?: boolean;
}

export function RecommendedCreators({ orderId, compact }: RecommendedCreatorsProps) {
  const [creators, setCreators] = useState<RecommendedCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await orderApi.recommendations(orderId) as any;
        setCreators(Array.isArray(res) ? res : []);
      } catch {
        setCreators([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
      </div>
    );
  }

  if (creators.length === 0) return null;

  if (compact) {
    return (
      <div className="card p-5">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary-500" />
          推荐创作者
        </h3>
        <div className="space-y-3">
          {creators.slice(0, 3).map((creator) => (
            <Link
              key={creator.userId}
              href={`/creators/${creator.userId}`}
              className="flex items-center gap-3 group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-white text-sm font-medium shrink-0">
                {creator.user.nickname[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">{creator.user.nickname}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {creator.rating}
                  </span>
                  <span>¥{creator.priceMin}-{creator.priceMax}</span>
                </div>
              </div>
              <span className="text-xs text-primary-500 font-medium">{creator.matchScore}分</span>
            </Link>
          ))}
        </div>
        {creators.length > 3 && (
          <p className="mt-3 text-xs text-gray-400 text-center">
            共 {creators.length} 位匹配创作者
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary-500" />
        推荐创作者
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {creators.map((creator) => (
          <Link
            key={creator.userId}
            href={`/creators/${creator.userId}`}
            className="card-hover p-4 group"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 text-white text-lg font-bold shrink-0">
                {creator.user.nickname[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600">{creator.user.nickname}</h3>
                  <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                    {creator.matchScore}分
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {creator.rating}
                  </span>
                  <span>{creator.orderCount}单完成</span>
                  <span className={cn(
                    'inline-block rounded-full px-1.5 py-0.5 text-[10px]',
                    creator.status === 'ONLINE' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  )}>
                    {creator.status === 'ONLINE' ? '在线' : '忙碌'}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{creator.bio}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {creator.matchReasons.map((reason, i) => (
                    <span key={i} className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] text-primary-600">
                      {reason}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">¥{creator.priceMin}-{creator.priceMax}</span>
                  <span className="text-xs text-primary-500 font-medium flex items-center gap-1 group-hover:underline">
                    查看主页 <Eye className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
