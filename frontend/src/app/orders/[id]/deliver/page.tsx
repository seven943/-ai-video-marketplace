'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, X, Video, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '@/lib/api';
import { ORDER_STATUS_LABELS, type Order } from '@/types';

export default function DeliverPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await orderApi.detail(params.id as string) as any;
        setOrder(res);
        if (res.status !== 'IN_PROGRESS') {
          toast.error('订单状态不正确');
          router.push(`/orders/${params.id}`);
        }
      } catch {
        toast.error('订单不存在');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchOrder();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryUrl.trim()) {
      toast.error('请填写交付链接');
      return;
    }
    setSubmitting(true);
    try {
      await orderApi.deliver(params.id as string);
      toast.success('提交审核成功！');
      router.push(`/orders/${params.id}`);
    } catch (err: any) {
      toast.error(err.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/orders/${order.id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回订单详情
      </Link>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Video className="h-6 w-6 text-primary-500" />
          提交交付物
        </h1>
        <p className="mt-1 text-sm text-gray-500">提交你的作品，等待买家审核</p>

        {/* 订单信息摘要 */}
        <div className="mt-6 rounded-xl bg-purple-50/50 p-4 ring-1 ring-primary-100">
          <h3 className="text-sm font-medium text-gray-900">{order.title}</h3>
          <p className="mt-1 text-xs text-gray-500">
            预算 ¥{order.budgetMin} - ¥{order.budgetMax} · 截止 {new Date(order.deadline).toLocaleDateString('zh-CN')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              交付链接 <span className="text-red-400">*</span>
            </label>
            <p className="mt-1 text-xs text-gray-400">粘贴视频文件链接（网盘、OSS 等）</p>
            <input
              type="url"
              value={deliveryUrl}
              onChange={(e) => setDeliveryUrl(e.target.value)}
              placeholder="https://drive.google.com/... 或 https://oss.example.com/..."
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">交付说明</label>
            <textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="说明你的作品亮点、使用的技术、注意事项等"
              rows={4}
              className="input-field mt-1.5 resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{deliveryNote.length}/500</p>
          </div>

          <div className="flex gap-3 border-t border-primary-100 pt-6">
            <Link href={`/orders/${order.id}`} className="btn-secondary flex-1 text-center">取消</Link>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '提交审核'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
