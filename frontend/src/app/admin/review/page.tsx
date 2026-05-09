'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShieldCheck, Loader2, CheckCircle2, RotateCcw, Eye, Clock, User, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, VIDEO_CATEGORY_LABELS, type Order } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminReviewPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.list({ status: 'REVIEWING', page: 1, pageSize: 50 }) as any;
      setOrders(res.items || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAction = async (orderId: string, action: 'complete' | 'revision') => {
    setActionId(orderId + action);
    try {
      if (action === 'complete') {
        await orderApi.complete(orderId);
        toast.success('审核通过，订单已完成');
      } else {
        await orderApi.requestRevision(orderId);
        toast.success('已要求修改');
      }
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || '操作失败');
    } finally {
      setActionId('');
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">无权访问，请使用管理员账号登录</p>
        <Link href="/login" className="mt-4 inline-block text-primary-500 hover:underline">去登录</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary-500" />
          审核中心
        </h1>
        <p className="mt-1 text-sm text-gray-500">审核创作者提交的作品，通过或要求修改</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : orders.length > 0 ? (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-gray-900">{order.title}</h3>
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', ORDER_STATUS_COLORS[order.status])}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2">{order.description}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="inline-block rounded-full bg-primary-100 px-2 py-0.5 text-primary-700">
                      {VIDEO_CATEGORY_LABELS[order.category]}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      ¥{order.budgetMin} - ¥{order.budgetMax}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      截止 {new Date(order.deadline).toLocaleDateString('zh-CN')}
                    </span>
                    {order.buyer && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        买家: {order.buyer.nickname}
                      </span>
                    )}
                    {order.creator && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        创作者: {order.creator.nickname}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-4 border-t border-primary-100 pt-4 flex items-center justify-between">
                <Link
                  href={`/orders/${order.id}`}
                  className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  查看详情
                </Link>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(order.id, 'revision')}
                    disabled={!!actionId}
                    className="btn-secondary text-sm px-5 py-2 flex items-center gap-1.5"
                  >
                    {actionId === order.id + 'revision' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    要求修改
                  </button>
                  <button
                    onClick={() => handleAction(order.id, 'complete')}
                    disabled={!!actionId}
                    className="btn-primary text-sm px-5 py-2 flex items-center gap-1.5"
                  >
                    {actionId === order.id + 'complete' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    审核通过
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center">
          <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无待审核订单</p>
        </div>
      )}
    </div>
  );
}
