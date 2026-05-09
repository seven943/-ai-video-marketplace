'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderCard } from '@/components/ui/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ORDER_STATUS_LABELS, type OrderStatus, type Order } from '@/types';
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

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState('');

  const isCreatorRole = user?.role === 'CREATOR' || user?.role === 'BOTH' || user?.role === 'ADMIN';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, pageSize: 50 };
      if (activeStatus !== 'all') params.status = activeStatus;
      const res = await orderApi.list(params) as any;
      setOrders(res.items || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

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

  const filteredOrders = searchQuery
    ? orders.filter((o) => o.title.includes(searchQuery) || o.description.includes(searchQuery))
    : orders;

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

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
          <input type="text" placeholder="搜索需求..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="mt-6 space-y-4">
          {filteredOrders.map((order) => (
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
        <EmptyState title="暂无需求" description="该状态下暂时没有需求单" action={<Link href="/orders/create" className="btn-primary">发布第一个需求</Link>} />
      )}
    </div>
  );
}
