'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShoppingCart, DollarSign, Video, TrendingUp, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { ORDER_STATUS_LABELS } from '@/types';

interface Stats {
  totalUsers: number;
  totalCreators: number;
  totalOrders: number;
  completedOrders: number;
  totalWorks: number;
  totalRevenue: number;
  recentUsers: { id: string; nickname: string; phone: string; role: string; createdAt: string }[];
  recentOrders: { id: string; title: string; status: string; budgetMin: number; budgetMax: number; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then((res: any) => setStats(res)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  }

  if (!stats) return <p className="text-center text-gray-500 py-20">加载失败</p>;

  const cards = [
    { label: '总用户', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: '创作者', value: stats.totalCreators, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: '总订单', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: '已完成', value: stats.completedOrders, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: '总作品', value: stats.totalWorks, icon: Video, color: 'bg-orange-50 text-orange-600' },
    { label: '总收入', value: `¥${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">数据概览</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{c.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${c.color}`}>
                <c.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent data */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">最近注册用户</h2>
            <Link href="/admin/users" className="text-xs text-primary-600 hover:underline">查看全部</Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900">{u.nickname || u.phone}</span>
                <span className="text-xs text-gray-400">{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">最近订单</h2>
            <Link href="/admin/orders" className="text-xs text-primary-600 hover:underline">查看全部</Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900 truncate mr-2">{o.title}</span>
                <span className="shrink-0 text-xs text-gray-400">{ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] || o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
