'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  title: string;
  status: string;
  budgetMin: number;
  budgetMax: number;
  createdAt: string;
  buyer: { id: string; nickname: string };
  creator: { id: string; nickname: string } | null;
}

const STATUS_OPTIONS = ['', 'PENDING', 'MATCHED', 'QUOTING', 'IN_PROGRESS', 'REVIEWING', 'COMPLETED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.orders({ page, pageSize: 20, status: statusFilter || undefined, keyword: keyword || undefined }) as any;
      setOrders(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch {} finally {
      setLoading(false);
    }
  }, [page, statusFilter, keyword]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">订单管理</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索订单标题..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">全部状态</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">订单标题</th>
                    <th className="px-4 py-3 font-medium">买家</th>
                    <th className="px-4 py-3 font-medium">创作者</th>
                    <th className="px-4 py-3 font-medium">预算</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-4 py-3 font-medium">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <Link href={`/orders/${o.id}`} className="text-gray-900 hover:text-primary-600 transition-colors">{o.title}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.buyer?.nickname || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{o.creator?.nickname || '待匹配'}</td>
                      <td className="px-4 py-3 text-gray-600">¥{o.budgetMin}-{o.budgetMax}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', ORDER_STATUS_COLORS[o.status as keyof typeof ORDER_STATUS_COLORS] || 'bg-gray-100 text-gray-600')}>
                          {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] || o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">上一页</button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">下一页</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
