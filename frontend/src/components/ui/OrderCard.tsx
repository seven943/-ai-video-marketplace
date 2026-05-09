'use client';

import Link from 'next/link';
import { Clock, User, ChevronRight, Loader2 } from 'lucide-react';
import type { Order } from '@/types';
import { VIDEO_CATEGORY_LABELS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { Badge } from './Badge';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  showAccept?: boolean;
  onAccept?: (orderId: string) => void;
  accepting?: boolean;
}

export function OrderCard({ order, showAccept, onAccept, accepting }: OrderCardProps) {
  return (
    <div className="card-hover group block p-5">
      <Link href={`/orders/${order.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {order.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm text-gray-500 leading-relaxed">
              {order.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="primary">{VIDEO_CATEGORY_LABELS[order.category]}</Badge>
              <Badge className={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1 font-semibold text-primary-600">
                {formatPrice(order.budgetMin)} - {formatPrice(order.budgetMax)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatRelativeTime(order.createdAt)}
              </span>
              {order.buyer && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {order.buyer.nickname}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" />
        </div>
      </Link>

      {/* 接单按钮 */}
      {showAccept && order.status === 'PENDING' && (
        <div className="mt-4 border-t border-primary-100 pt-4 flex justify-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              onAccept?.(order.id);
            }}
            disabled={accepting}
            className="btn-primary text-sm px-6 py-2"
          >
            {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : '立即接单'}
          </button>
        </div>
      )}
    </div>
  );
}
