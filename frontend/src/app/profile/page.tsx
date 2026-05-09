'use client';

import { useState, useEffect } from 'react';
import { User, ShoppingBag, Video, Star, Settings, LogOut, ChevronRight, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store';
import { userApi, orderApi, worksApi } from '@/lib/api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import toast from 'react-hot-toast';

type Tab = 'orders' | 'works' | 'settings';

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, ordersRes, worksRes] = await Promise.allSettled([
        userApi.getProfile(),
        orderApi.list({ page: 1, pageSize: 20 }),
        worksApi.list({ page: 1, pageSize: 20 }),
      ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value as any);
      if (ordersRes.status === 'fulfilled') setOrders((ordersRes.value as any)?.items || []);
      if (worksRes.status === 'fulfilled') setWorks((worksRes.value as any)?.items || []);
    } catch {} finally { setLoading(false); }
  };

  const tabs = [
    { key: 'orders' as Tab, label: '我的订单', icon: ShoppingBag },
    { key: 'works' as Tab, label: '我的作品', icon: Video },
    { key: 'settings' as Tab, label: '账号设置', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const displayUser = profile || user;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 shadow-lg ring-4 ring-white">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold text-gray-900">{displayUser?.nickname || '用户'}</h1>
              <p className="text-sm text-gray-500">{displayUser?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Badge variant="primary">{displayUser?.role === 'CREATOR' ? '创作者' : displayUser?.role === 'BOTH' ? '买家/创作者' : '买家'}</Badge>
            <span className="flex items-center gap-1 text-xs text-yellow-600">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              信用分 {displayUser?.creditScore || 100}
            </span>
            <span className="flex items-center gap-1 text-xs text-primary-500">
              <Shield className="h-3.5 w-3.5" />已认证
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <nav className="card overflow-hidden">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500' : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                }`}
              >
                <tab.icon className="h-4 w-4" />{tab.label}
                <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
              </button>
            ))}
            <button onClick={() => { logout(); toast.success('已退出登录'); window.location.href = '/'; }}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 border-l-2 border-transparent transition-all"
            >
              <LogOut className="h-4 w-4" />退出登录
            </button>
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div className="card overflow-hidden">
              <div className="border-b border-primary-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">我的订单</h2>
              </div>
              {orders.length > 0 ? (
                <div className="divide-y divide-primary-50">
                  {orders.map((order: any) => (
                    <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-primary-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.title}</p>
                        <p className="mt-1 text-xs text-gray-500">预算 ¥{order.budgetMin}-{order.budgetMax}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}>{ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}</Badge>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-sm text-gray-500">暂无订单</div>
              )}
            </div>
          )}

          {activeTab === 'works' && (
            <div className="card overflow-hidden">
              <div className="border-b border-primary-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">我的作品</h2>
              </div>
              {works.length > 0 ? (
                <div className="divide-y divide-primary-50">
                  {works.map((work: any) => (
                    <Link key={work.id} href={`/works/${work.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-primary-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{work.title}</p>
                        <p className="mt-1 text-xs text-gray-500">{work.viewCount} 浏览 · {work.likeCount} 点赞</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-sm text-gray-500">暂无作品</div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900">账号设置</h2>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">昵称</label>
                  <input type="text" defaultValue={displayUser?.nickname || ''} className="input-field mt-1.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">头像</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <button className="btn-secondary text-sm">更换头像</button>
                  </div>
                </div>
                <button className="btn-primary">保存修改</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
