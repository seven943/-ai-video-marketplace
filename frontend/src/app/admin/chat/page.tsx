'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageSquare, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface BlockedMessage {
  id: string;
  content: string;
  senderId: string;
  blocked: boolean;
  createdAt: string;
  sender: { id: string; nickname: string; phone: string };
  conversation: {
    order: { id: string; title: string };
    buyer: { id: string; nickname: string };
    creator: { id: string; nickname: string };
  };
}

interface AdminConversation {
  id: string;
  orderId: string;
  updatedAt: string;
  order: { id: string; title: string; status: string };
  buyer: { id: string; nickname: string };
  creator: { id: string; nickname: string };
  _count: { messages: number };
}

type TabType = 'blocked' | 'conversations';

export default function AdminChatPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<TabType>('blocked');
  const [blockedMessages, setBlockedMessages] = useState<BlockedMessage[]>([]);
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchBlocked = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chatApi.adminBlocked({ page, pageSize }) as any;
      setBlockedMessages(res.items || []);
      setTotal(res.total || 0);
    } catch {} finally {
      setLoading(false);
    }
  }, [page]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chatApi.adminConversations({ page, pageSize }) as any;
      setConversations(res.items || []);
      setTotal(res.total || 0);
    } catch {} finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      if (tab === 'blocked') fetchBlocked();
      else fetchConversations();
    }
  }, [user, tab, page, fetchBlocked, fetchConversations]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">仅管理员可访问</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <ShieldCheck className="h-6 w-6 text-primary-500" />
        聊天监控中心
      </h1>

      {/* 标签切换 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setTab('blocked'); setPage(1); }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            tab === 'blocked'
              ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          被拦截消息
        </button>
        <button
          onClick={() => { setTab('conversations'); setPage(1); }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            tab === 'conversations'
              ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          所有会话
        </button>
      </div>

      {/* 内容 */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : tab === 'blocked' ? (
          blockedMessages.length > 0 ? (
            <div className="divide-y divide-red-50">
              {blockedMessages.map((msg) => (
                <div key={msg.id} className="px-6 py-4 bg-red-50/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{msg.sender.nickname}</span>
                        <span className="text-xs text-gray-500">({msg.sender.phone})</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          被拦截
                        </span>
                      </div>
                      <p className="text-sm text-red-600 mb-1">{msg.content}</p>
                      <p className="text-xs text-gray-500">
                        会话：{msg.conversation.buyer.nickname} ↔ {msg.conversation.creator.nickname}
                        {' · '}订单：{msg.conversation.order.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
              <p>暂无被拦截的消息</p>
            </div>
          )
        ) : (
          conversations.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {conv.buyer.nickname} ↔ {conv.creator.nickname}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      订单：{conv.order.title} · {conv._count.messages} 条消息
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      conv.order.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                      conv.order.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' :
                      'bg-primary-50 text-primary-600'
                    )}>
                      {conv.order.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.updatedAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-2" />
              <p>暂无会话</p>
            </div>
          )
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
