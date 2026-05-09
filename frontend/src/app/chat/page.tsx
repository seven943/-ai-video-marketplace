'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Loader2 } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useSocket } from '@/lib/socket';
import { ConversationList } from '@/components/chat/ConversationList';

interface Conversation {
  id: string;
  orderId: string;
  buyerId: string;
  creatorId: string;
  updatedAt: string;
  order: { id: string; title: string; status: string };
  buyer: { id: string; nickname: string; avatar: string };
  creator: { id: string; nickname: string; avatar: string };
  messages: { content: string; createdAt: string; senderId: string; blocked: boolean }[];
}

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatApi.conversations() as any;
      setConversations(Array.isArray(res) ? res : []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-gray-500">请先登录</p>
        <Link href="/login" className="mt-4 inline-block text-primary-500 hover:underline">去登录</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6 text-primary-500" />
        我的消息
      </h1>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <ConversationList conversations={conversations} userId={user.id} />
        )}
      </div>
    </div>
  );
}
