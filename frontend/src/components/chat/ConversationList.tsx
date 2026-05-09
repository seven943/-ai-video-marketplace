'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  orderId: string;
  buyerId: string;
  creatorId: string;
  updatedAt: string;
  order: {
    id: string;
    title: string;
    status: string;
  };
  buyer: {
    id: string;
    nickname: string;
    avatar: string;
  };
  creator: {
    id: string;
    nickname: string;
    avatar: string;
  };
  messages: {
    content: string;
    createdAt: string;
    senderId: string;
    blocked: boolean;
  }[];
}

interface ConversationListProps {
  conversations: Conversation[];
  userId: string;
  activeId?: string;
}

export function ConversationList({ conversations, userId, activeId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <MessageSquare className="h-10 w-10 mb-2" />
        <p className="text-sm">暂无会话</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {conversations.map((conv) => {
        const other = conv.buyerId === userId ? conv.creator : conv.buyer;
        const lastMsg = conv.messages[0];
        const isActive = conv.id === activeId;

        return (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className={cn(
              'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50',
              isActive && 'bg-primary-50/50'
            )}
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-600">
              {other.nickname.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {other.nickname}
                </p>
                {lastMsg && (
                  <p className="text-xs text-gray-400">
                    {new Date(lastMsg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {conv.order.title}
              </p>
              {lastMsg && (
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {lastMsg.blocked ? '[消息被拦截]' : lastMsg.content}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
