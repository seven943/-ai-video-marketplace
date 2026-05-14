'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShoppingBag, Video, Star, Settings, LogOut, ChevronRight, Shield, Loader2, Edit3, Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store';
import { userApi, orderApi, worksApi } from '@/lib/api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirmDialog } from '@/lib/hooks';
import { cn } from '@/lib/utils';

type Tab = 'orders' | 'works' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [profile, setProfile] = useState<any>(null);
  const confirmDialog = useConfirmDialog();
  const [orders, setOrders] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editNickname, setEditNickname] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const profileRes = await userApi.getProfile().catch(() => null);
      const p = profileRes as any;
      if (p) {
        setProfile(p);
        setEditNickname(p?.nickname || '');
      }
      const userRole = p?.role || user?.role;
      const promises: Promise<any>[] = [orderApi.list({ page: 1, pageSize: 20 })];
      if (userRole === 'CREATOR' || userRole === 'BOTH') {
        promises.push(worksApi.list({ page: 1, pageSize: 20 }));
      }
      const results = await Promise.allSettled(promises);
      if (results[0].status === 'fulfilled') setOrders((results[0].value as any)?.items || []);
      if (results[1]?.status === 'fulfilled') setWorks((results[1].value as any)?.items || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSaveNickname = async () => {
    if (!editNickname.trim()) {
      toast.error('昵称不能为空');
      return;
    }
    setSaving(true);
    try {
      await userApi.updateProfile({ nickname: editNickname });
      toast.success('昵称已更新');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const displayUser = profile || user;
  const roleLabel = displayUser?.role === 'CREATOR' ? '创作者' : displayUser?.role === 'BOTH' ? '买家 / 创作者' : '买家';
  const isCreator = displayUser?.role === 'CREATOR' || displayUser?.role === 'BOTH';

  useEffect(() => {
    if (!loading && activeTab === 'works' && !isCreator) {
      setActiveTab('orders');
    }
  }, [loading, activeTab, isCreator]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const tabs = [
    { key: 'orders' as Tab, label: '我的订单', icon: ShoppingBag, count: orders.length },
    ...(isCreator ? [{ key: 'works' as Tab, label: '我的作品', icon: Video, count: works.length }] : []),
    { key: 'settings' as Tab, label: '账号设置', icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400" />
        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-5">
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl ring-4 ring-white">
                <span className="text-4xl font-bold text-white">{displayUser?.nickname?.[0] || '用'}</span>
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-gray-900">{displayUser?.nickname || '用户'}</h1>
                <p className="mt-0.5 text-sm text-gray-500">{displayUser?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {roleLabel}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    信用分 {displayUser?.creditScore || 100}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-indigo-500">
                    <Shield className="h-3.5 w-3.5" />已认证
                  </span>
                </div>
              </div>
            </div>
            <Link href="/creators/edit" className="btn-secondary flex items-center gap-2 text-sm shrink-0">
              <Edit3 className="h-3.5 w-3.5" />
              编辑资料
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <nav className="card overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500'
                    : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-xs text-gray-400">{tab.count}</span>
                )}
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))}
            <button
              onClick={async () => {
                const confirmed = await confirmDialog.confirm({
                  title: '退出登录',
                  message: '确定要退出当前账号吗？',
                  confirmText: '退出',
                  danger: true,
                });
                if (confirmed) { logout(); toast.success('已退出登录'); router.push('/'); }
              }}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 border-l-2 border-transparent transition-all"
            >
              <LogOut className="h-4 w-4" />退出登录
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div className="card overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900">我的订单</h2>
              </div>
              {orders.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {orders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50/50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600">{order.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">预算 ¥{order.budgetMin} - ¥{order.budgetMax}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]
                        )}>
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-400">暂无订单</p>
                  <Link href="/orders" className="mt-3 inline-block text-sm text-indigo-500 hover:text-indigo-600">去需求大厅看看</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'works' && (
            <div className="card overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">我的作品</h2>
                <Link href="/works/create" className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">发布作品</Link>
              </div>
              {works.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {works.map((work: any) => (
                    <Link
                      key={work.id}
                      href={`/works/${work.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-indigo-50/50 transition-colors group"
                    >
                      <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 overflow-hidden shrink-0">
                        {work.coverUrl ? (
                          <img src={work.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <Video className="h-5 w-5 text-indigo-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600">{work.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{work.viewCount}</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{work.likeCount}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <Video className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-400">暂无作品</p>
                  <Link href="/works/create" className="mt-3 inline-block text-sm text-indigo-500 hover:text-indigo-600">发布第一个作品</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900">账号设置</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">昵称</label>
                  <div className="mt-1.5 flex gap-3">
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={handleSaveNickname}
                      disabled={saving}
                      className="btn-primary px-4"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">头像</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                      <span className="text-2xl font-bold text-white">{displayUser?.nickname?.[0] || '用'}</span>
                    </div>
                    <button className="btn-secondary text-sm">更换头像</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">手机号</label>
                  <p className="mt-1.5 text-sm text-gray-500">{displayUser?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
                  <p className="mt-1 text-xs text-gray-400">手机号不可修改</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        danger={confirmDialog.danger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.cancel}
      />
    </div>
  );
}
