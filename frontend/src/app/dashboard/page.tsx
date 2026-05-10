'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, DollarSign, TrendingUp, Package, Star, Eye, Heart, BarChart3, PieChart } from 'lucide-react';
import { creatorApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ORDER_STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface DashboardData {
  income: { total: number; thisMonth: number; escrow: number };
  orders: { total: number; completed: number; inProgress: number; cancelled: number };
  works: { totalViews: number; totalLikes: number; count: number };
  rating: { average: number; count: number };
  monthlyRevenue: { month: string; amount: number }[];
  orderStatusDist: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-400',
  MATCHED: 'bg-blue-400',
  QUOTING: 'bg-cyan-400',
  QUOTE_ACCEPTED: 'bg-teal-400',
  IN_PROGRESS: 'bg-purple-400',
  REVIEWING: 'bg-orange-400',
  REVISION: 'bg-orange-300',
  COMPLETED: 'bg-green-400',
  CANCELLED: 'bg-gray-400',
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await creatorApi.dashboard() as any;
        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-gray-500">加载失败，请重试</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.amount), 1);
  const totalOrderDist = data.orderStatusDist.reduce((a, b) => a + b.count, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary-500" />
          数据看板
        </h1>
        <p className="mt-1 text-sm text-gray-500">查看你的收入、订单和作品数据</p>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">总收入</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">¥{data.income.total.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-400">本月 ¥{data.income.thisMonth.toLocaleString()}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">托管中</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">¥{data.income.escrow.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-400">验收后自动释放</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">完成订单</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
              <Package className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{data.orders.completed}</p>
          <p className="mt-1 text-xs text-gray-400">共 {data.orders.total} 单，{data.orders.inProgress} 单进行中</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">平均评分</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{data.rating.average.toFixed(1)}</p>
          <p className="mt-1 text-xs text-gray-400">{data.rating.count} 条评价</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* 月收入趋势 */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            近6个月收入趋势
          </h2>
          <div className="flex items-end gap-2" style={{ height: 200 }}>
            {data.monthlyRevenue.map((item) => {
              const height = maxRevenue > 0 ? (item.amount / maxRevenue) * 160 : 0;
              const monthLabel = item.month.split('-')[1] + '月';
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">
                    {item.amount > 0 ? `¥${item.amount.toLocaleString()}` : '-'}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary-500 to-primary-400 transition-all"
                    style={{ height: Math.max(height, 4) }}
                  />
                  <span className="text-xs text-gray-400">{monthLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 订单状态分布 */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary-500" />
            订单状态分布
          </h2>
          <div className="space-y-3">
            {data.orderStatusDist.map((item) => {
              const pct = totalOrderDist > 0 ? Math.round((item.count / totalOrderDist) * 100) : 0;
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{ORDER_STATUS_LABELS[item.status as keyof typeof ORDER_STATUS_LABELS] || item.status}</span>
                    <span className="font-medium text-gray-900">{item.count} 单</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn('h-full rounded-full', STATUS_COLORS[item.status] || 'bg-gray-300')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 作品数据 */}
      <div className="mt-6 card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary-500" />
          作品数据
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.works.count}</p>
            <p className="text-xs text-gray-500">作品数量</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.works.totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-500">总播放量</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.works.totalLikes.toLocaleString()}</p>
            <p className="text-xs text-gray-500">总点赞数</p>
          </div>
        </div>
      </div>
    </div>
  );
}
