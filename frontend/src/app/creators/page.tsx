'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, Users, Star, Filter, X } from 'lucide-react';
import { creatorApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useDebounce, useSearchShortcut } from '@/lib/hooks';
import { ErrorState } from '@/components/ui/ErrorState';
import { CreatorCardSkeleton } from '@/components/ui/Skeleton';
import { Highlight } from '@/components/ui/Highlight';

const popularTags = ['商品展示', '品牌宣传', '短视频', '解说视频', '社交媒体', '教育培训', '娱乐创意'];
const popularAiTools = ['Kling', 'Runway', 'Sora', 'Midjourney', 'ComfyUI', 'Flux', 'Pika', 'Stable Diffusion'];
const priceRanges = [
  { label: '不限', min: 0, max: 99999 },
  { label: '100以内', min: 0, max: 100 },
  { label: '100-500', min: 100, max: 500 },
  { label: '500-2000', min: 500, max: 2000 },
  { label: '2000以上', min: 2000, max: 99999 },
];

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
  user: { id: string; nickname: string; avatar: string };
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword);
  const searchRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(searchRef);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(0);
  const [showFilter, setShowFilter] = useState(false);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page: 1, pageSize: 50 };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (selectedTags.length) params.tags = selectedTags.join(',');
      if (selectedTools.length) params.aiTools = selectedTools.join(',');
      if (priceRange > 0) {
        params.priceMin = priceRanges[priceRange].min;
        params.priceMax = priceRanges[priceRange].max;
      }
      const res = await creatorApi.list(params) as any;
      setCreators(res.items || []);
    } catch {
      setCreators([]);
      setError('加载创作者失败');
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, selectedTags, selectedTools, priceRange]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) => prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedTools([]);
    setPriceRange(0);
    setKeyword('');
  };

  const hasFilters = selectedTags.length > 0 || selectedTools.length > 0 || priceRange > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-500" />
            找创作者
          </h1>
          <p className="mt-1 text-sm text-gray-500">发现优秀的 AI 视频创作者</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
            <input
              type="text"
              ref={searchRef}
              placeholder="搜索创作者... (按 / 聚焦)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={cn('btn-secondary gap-2', showFilter && 'ring-primary-300')}
          >
            <Filter className="h-4 w-4" />
            筛选
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="mt-4 card p-5 space-y-4">
          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">擅长领域</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* AI Tools */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">AI 工具</h3>
            <div className="flex flex-wrap gap-2">
              {popularAiTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                    selectedTools.includes(tool)
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  )}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">价格范围</h3>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => setPriceRange(idx)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                    priceRange === idx
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1">
              <X className="h-3.5 w-3.5" /> 清除筛选
            </button>
          )}
        </div>
      )}

      {/* Creator List */}
      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CreatorCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCreators} />
      ) : creators.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <Link
              key={creator.userId}
              href={`/creators/${creator.userId}`}
              className="card-hover group p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 text-xl font-bold text-white shadow-lg">
                  {creator.user.nickname[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                    <Highlight text={creator.user.nickname} keyword={debouncedKeyword} />
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{creator.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{creator.orderCount} 单</span>
                    <span className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-xs',
                      creator.status === 'ONLINE' ? 'bg-green-100 text-green-700' :
                      creator.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    )}>
                      {creator.status === 'ONLINE' ? '在线' : creator.status === 'BUSY' ? '忙碌' : '离线'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed"><Highlight text={creator.bio} keyword={debouncedKeyword} /></p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {creator.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs text-primary-600">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-primary-100 pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {creator.aiTools.slice(0, 3).map((tool) => (
                    <span key={tool} className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-600">
                      {tool}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-primary-600">
                  ¥{creator.priceMin}-{creator.priceMax}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : debouncedKeyword || hasFilters ? (
        <div className="mt-20 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">未找到符合条件的创作者</p>
          <p className="mt-1 text-sm text-gray-400">试试调整搜索词或筛选条件</p>
          <button onClick={clearFilters} className="mt-3 btn-secondary text-sm">
            清除所有条件
          </button>
        </div>
      ) : (
        <div className="mt-20 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无创作者</p>
        </div>
      )}
    </div>
  );
}
