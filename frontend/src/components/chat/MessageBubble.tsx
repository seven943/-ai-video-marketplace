'use client';

import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  senderId: string;
  type: string;
  blocked: boolean;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    nickname: string;
    avatar: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn('flex gap-2 mb-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
          {message.sender.nickname.charAt(0)}
        </div>
      </div>
      <div className={cn('max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        <p className={cn('text-xs mb-1', isOwn ? 'text-right' : 'text-left')}>
          <span className="text-gray-500">{message.sender.nickname}</span>
          <span className="text-gray-400 ml-2">
            {new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </p>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            isOwn
              ? 'bg-primary-500 text-white rounded-tr-md'
              : 'bg-gray-100 text-gray-900 rounded-tl-md',
            message.blocked && 'bg-red-50 text-red-600 border border-red-200'
          )}
        >
          {message.blocked ? (
            <div>
              <p className="text-xs text-red-500 mb-1">消息已被系统拦截</p>
              <p>{message.content}</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        {isOwn && !message.blocked && (
          <p className="text-xs text-gray-400 mt-1 text-right">
            {message.read ? '已读' : '未读'}
          </p>
        )}
      </div>
    </div>
  );
}
