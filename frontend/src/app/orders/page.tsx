'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, Loader2, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderCard } from '@/components/ui/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ORDER_STATUS_LABELS, VIDEO_CATEGORY_LABELS, type OrderStatus, type VideoCategory, type Order } from '@/types';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const statusFilters: (OrderStatus | 'all')[] = [
  'all', 'PENDING', 'MATCHED', 'IN_PROGRESS', 'REVIEWING', 'REVISION', 'COMPLETED', 'CANCELLED',
];

const statusLabels: Record<string, string> = {
  all: '全部',
  ...ORDER_STATUS_LABELS,
};

const categoryOptions: { value: string; label: string }[] = [
  { value: '', label: '全部分类' },
  ...Object.entries(VIDEO_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

const sortOptions = [
  { value: '', label: '最新发布' },
  { value: 'budget_asc', label: '预算从低到高' },
  { value: 'budget_desc', label: '预算从高到低' },
];

const budgetRanges = [
  { label: '全部', min: 0, max: 0 },
  { label: '100以内', min: 0, max: 100 },
  { label: '100-500', min: 100, max: 500 },
  { label: '500-2000', min: 500, max: 2000 },
  { label: '2000-5000', min: 2000, max: 5000 },
  { label: '5000以上', min: 5000, max: 0 },
];

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(0);
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout>();

  const isCreatorRole = user?.role === 'CREATOR' || user?.role === 'BOTH' || user?.role === 'ADMIN';

  // Debounce search keyword
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedKeyword(searchQuery);
    }, 500);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, pageSize: 50 };
      if (activeStatus !== 'all') params.status = activeStatus;
      if (category) params.category = category;
      if (budgetMin) params.budgetMin = budgetMin;
      if (budgetMax) params.budgetMax = budgetMax;
      if (sort) params.sort = sort;
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      const res = await orderApi.list(params) as any;
      setOrders(res.items || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeStatus, category, budgetMin, budgetMax, sort, debouncedKeyword]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAccept = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      await orderApi.accept(orderId);
      toast.success('接单成功！');
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || '接单失败');
    } finally {
      setAcceptingId('');
    }
  };

  const handleBudgetRange = (min: number, max: number) => {
    setBudgetMin(min);
    setBudgetMax(max);
  };

  const clearFilters = () => {
    setCategory('');
    setBudgetMin(0);
    setBudgetMax(0);
    setSort('');
    setSearchQuery('');
  };

  const hasActiveFilters = category || budgetMin || budgetMax || sort;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-500" />
            需求大厅
          </h1>
          <p className="mt-1 text-sm text-gray-500">浏览最新的AI视频制作需求，找到适合你的订单</p>
        </div>
        <Link href="/orders/create" className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          发布需求
        </Link>
      </div>

      {/* Status tabs + Search + Filter button */}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {statusFilters.map((status) => (
              <button key={status} onClick={() => setActiveStatus(status)}
                className={cn('whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                  activeStatus === status
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25'
                    : 'bg-white/80 text-gray-600 ring-1 ring-primary-100 hover:bg-primary-50 hover:text-primary-600 backdrop-blur-sm'
                )}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                placeholder="搜索需求..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                showFilters || hasActiveFilters
                  ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-200'
                  : 'bg-white/80 text-gray-600 ring-1 ring-primary-100 hover:bg-primary-50'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              筛选
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                  {[category, budgetMin || budgetMax, sort].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">筛选条件</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600">
                  <X className="h-3 w-3" />
                  清除筛选
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">视频分类</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCategory(opt.value)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                      category === opt.value
                        ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget range */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">预算范围</label>
              <div className="flex flex-wrap gap-2">
                {budgetRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handleBudgetRange(range.min, range.max)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                      budgetMin === range.min && budgetMax === range.max
                        ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {range.label === '全部' ? range.label : `¥${range.label}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">排序方式</label>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                      sort === opt.value
                        ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : orders.length > 0 ? (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showAccept={isCreatorRole && order.status === 'PENDING' && !order.creatorId}
              onAccept={handleAccept}
              accepting={acceptingId === order.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="暂无需求" description="该筛选条件下暂时没有需求单" action={<Link href="/orders/create" className="btn-primary">发布第一个需求</Link>} />
      )}
    </div>
  );
}
