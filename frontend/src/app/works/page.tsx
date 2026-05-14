'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Loader2, Plus } from 'lucide-react';
import { WorkCard } from '@/components/ui/WorkCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { WorkCardSkeleton } from '@/components/ui/Skeleton';
import { VIDEO_CATEGORY_LABELS, type VideoCategory, type Work } from '@/types';
import { worksApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const categories: (VideoCategory | 'all')[] = [
  'all', 'PRODUCT', 'BRAND', 'SHORT_VIDEO', 'EXPLAINER', 'SOCIAL', 'EDUCATION', 'ENTERTAINMENT',
];

const categoryLabels: Record<string, string> = {
  all: '全部',
  ...VIDEO_CATEGORY_LABELS,
};

export default function WorksPage() {
  const user = useAuthStore((s) => s.user);
  const isCreatorRole = user?.role === 'CREATOR' || user?.role === 'BOTH' || user?.role === 'ADMIN';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page: 1, pageSize: 50 };
      if (activeCategory !== 'all') params.category = activeCategory;
      const res = await worksApi.list(params) as any;
      setWorks(res.items || []);
    } catch {
      setWorks([]);
      setError('加载作品失败');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const filteredWorks = searchQuery
    ? works.filter((w) => w.title.includes(searchQuery))
    : works;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-500" />
            浏览作品
          </h1>
          <p className="mt-1 text-sm text-gray-500">发现优秀AI视频创作者的作品</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
            <input type="text" placeholder="搜索作品..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
          </div>
          {isCreatorRole && (
            <Link href="/works/create" className="btn-primary gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              发布作品
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={cn('whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
              activeCategory === cat
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25'
                : 'bg-white/80 text-gray-600 ring-1 ring-primary-100 hover:bg-primary-50 hover:text-primary-600 backdrop-blur-sm'
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <WorkCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchWorks} />
      ) : filteredWorks.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWorks.map((work) => (
            <WorkCard key={work.id} work={work} searchKeyword={searchQuery} />
          ))}
        </div>
      ) : (
        <EmptyState title="暂无作品" description="该分类下暂时没有作品，换个分类看看吧" />
      )}
    </div>
  );
}
