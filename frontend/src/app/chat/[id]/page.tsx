'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useSocket } from '@/lib/socket';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ConversationList } from '@/components/chat/ConversationList';
import type { Conversation } from '@/types';

export default function ChatDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const user = useAuthStore((s) => s.user);
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConv, setCurrentConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await chatApi.conversations() as any;
      const convs = Array.isArray(res) ? res : [];
      setConversations(convs);
      setCurrentConv(convs.find((c: Conversation) => c.id === conversationId) || null);
    } catch {} finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-gray-500">请先登录</p>
        <Link href="/login" className="mt-4 inline-block text-primary-500 hover:underline">去登录</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/chat" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回会话列表
      </Link>

      <div className="card flex h-[600px] overflow-hidden">
        {/* 左侧会话列表 */}
        <div className="w-72 border-r border-gray-100 overflow-y-auto hidden md:block">
          <ConversationList
            conversations={conversations}
            userId={user.id}
            activeId={conversationId}
          />
        </div>

        {/* 右侧聊天窗口 */}
        <div className="flex-1 flex flex-col">
          {currentConv ? (
            <ChatWindow
              conversationId={conversationId}
              userId={user.id}
              socket={socket}
              orderTitle={currentConv.order.title}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>会话不存在</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
