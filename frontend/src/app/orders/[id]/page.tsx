'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calendar, DollarSign, User, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { VIDEO_CATEGORY_LABELS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type Order, type Review } from '@/types';
import { ReviewForm } from '@/components/ui/ReviewForm';
import { ReviewList } from '@/components/ui/ReviewList';
import { cn } from '@/lib/utils';

const statusTimeline: { status: string; label: string; icon: typeof CheckCircle2 }[] = [
  { status: 'PENDING', label: '待匹配', icon: Clock },
  { status: 'MATCHED', label: '已匹配', icon: User },
  { status: 'IN_PROGRESS', label: '制作中', icon: AlertCircle },
  { status: 'REVIEWING', label: '审核中', icon: AlertCircle },
  { status: 'COMPLETED', label: '已完成', icon: CheckCircle2 },
];

const terminalStatuses = ['COMPLETED', 'CANCELLED'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [order, setOrder] = useState<Order & { reviews?: Review[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      const res = await orderApi.detail(params.id as string) as any;
      setOrder(res);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchOrder();
  }, [params.id, fetchOrder]);

  const handleAction = async (action: string, apiCall: () => Promise<unknown>) => {
    setActionLoading(action);
    try {
      await apiCall();
      toast.success('操作成功');
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message || '操作失败');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-gray-500">订单不存在</p>
        <Link href="/orders" className="mt-4 inline-block text-primary-500 hover:underline">返回需求大厅</Link>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isCreatorRole = user?.role === 'CREATOR' || user?.role === 'BOTH';
  const isAssignedCreator = user?.id === order.creatorId;
  const isTerminal = terminalStatuses.includes(order.status);
  const isREVISION = order.status === 'REVISION';

  // 当前状态在时间线中的位置
  const currentStep = statusTimeline.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回需求大厅
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：订单信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-gray-900">{order.title}</h1>
              <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', ORDER_STATUS_COLORS[order.status])}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{order.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-primary-100 pt-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <DollarSign className="h-4 w-4 text-primary-400" />
                <span>预算：¥{order.budgetMin} - ¥{order.budgetMax}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4 text-primary-400" />
                <span>截止：{new Date(order.deadline).toLocaleDateString('zh-CN')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                  {VIDEO_CATEGORY_LABELS[order.category]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 text-primary-400" />
                <span>发布于 {new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>

          {/* 状态时间线 */}
          {!isCancelled && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">订单进度</h2>
              <div className="flex items-center justify-between">
                {statusTimeline.map((step, idx) => {
                  const isActive = idx === currentStep;
                  const isDone = idx < currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full transition-all',
                        isDone ? 'bg-primary-500 text-white' :
                        isActive ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500' :
                        'bg-gray-100 text-gray-400'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={cn('mt-1.5 text-xs', isActive ? 'font-medium text-primary-600' : 'text-gray-400')}>
                        {step.label}
                      </span>
                      {idx < statusTimeline.length - 1 && (
                        <div className={cn('absolute h-0.5 w-full', isDone ? 'bg-primary-500' : 'bg-gray-200')} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="card p-6 border-red-200 bg-red-50/50">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">订单已取消</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          {!isTerminal && user && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">操作</h2>
              <div className="flex flex-wrap gap-3">
                {/* 接单（创作者角色，订单待匹配且未被接） */}
                {isCreatorRole && order.status === 'PENDING' && !order.creatorId && (
                  <button
                    onClick={() => handleAction('accept', () => orderApi.accept(order.id))}
                    disabled={!!actionLoading}
                    className="btn-primary"
                  >
                    {actionLoading === 'accept' ? <Loader2 className="h-4 w-4 animate-spin" /> : '接单'}
                  </button>
                )}

                {/* 开始制作（已接单的创作者） */}
                {isAssignedCreator && order.status === 'MATCHED' && (
                  <button
                    onClick={() => handleAction('start', () => orderApi.start(order.id))}
                    disabled={!!actionLoading}
                    className="btn-primary"
                  >
                    {actionLoading === 'start' ? <Loader2 className="h-4 w-4 animate-spin" /> : '开始制作'}
                  </button>
                )}

                {/* 提交审核（已接单的创作者） */}
                {isAssignedCreator && order.status === 'IN_PROGRESS' && (
                  <Link href={`/orders/${order.id}/deliver`} className="btn-primary">
                    提交交付物
                  </Link>
                )}

                {/* 买家操作 */}
                {isBuyer && (order.status === 'REVIEWING' || isREVISION) && (
                  <>
                    <button
                      onClick={() => handleAction('complete', () => orderApi.complete(order.id))}
                      disabled={!!actionLoading}
                      className="btn-primary"
                    >
                      {actionLoading === 'complete' ? <Loader2 className="h-4 w-4 animate-spin" /> : '确认完成'}
                    </button>
                    {order.status === 'REVIEWING' && (
                      <button
                        onClick={() => handleAction('revision', () => orderApi.requestRevision(order.id))}
                        disabled={!!actionLoading}
                        className="btn-secondary"
                      >
                        {actionLoading === 'revision' ? <Loader2 className="h-4 w-4 animate-spin" /> : '要求修改'}
                      </button>
                    )}
                  </>
                )}

                {/* 取消 */}
                <button
                  onClick={() => handleAction('cancel', () => orderApi.cancel(order.id))}
                  disabled={!!actionLoading}
                  className="btn-secondary text-red-600 hover:text-red-700"
                >
                  {actionLoading === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : '取消订单'}
                </button>
              </div>
            </div>
          )}

          {/* 评价区域 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">评价</h2>

            {order.reviews && order.reviews.length > 0 && (
              <ReviewList reviews={order.reviews as any} />
            )}

            {order.status === 'COMPLETED' && isBuyer && !(order.reviews?.some((r: any) => r.reviewerId === user?.id)) && (
              <ReviewForm orderId={order.id} onSuccess={fetchOrder} />
            )}
          </div>
        </div>

        {/* 右侧：用户信息 */}
        <div className="space-y-6">
          {/* 买家 */}
          <div className="card p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">买家</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-medium">
                {order.buyer?.nickname?.[0] || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{order.buyer?.nickname || '未知'}</p>
              </div>
            </div>
          </div>

          {/* 创作者 */}
          {order.creator && (
            <div className="card p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">创作者</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-medium">
                  {order.creator?.nickname?.[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.creator?.nickname || '未知'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 支付信息 */}
          {(order as any).payment && (
            <div className="card p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">支付信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">金额</span>
                  <span className="font-medium text-gray-900">¥{(order as any).payment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">状态</span>
                  <span className={cn('font-medium',
                    (order as any).payment.status === 'RELEASED' ? 'text-green-600' :
                    (order as any).payment.status === 'PAID' ? 'text-blue-600' :
                    (order as any).payment.status === 'REFUNDED' ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {({ 'PENDING': '待支付', 'PAID': '已支付', 'RELEASED': '已释放', 'REFUNDED': '已退款' } as Record<string, string>)[(order as any).payment.status] || (order as any).payment.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
