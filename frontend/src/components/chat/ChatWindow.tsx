'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { chatApi } from '@/lib/api';
import toast from 'react-hot-toast';

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

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  socket: Socket | null;
  orderTitle?: string;
}

export function ChatWindow({ conversationId, userId, socket, orderTitle }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatApi.messages(conversationId) as any;
      const items = res?.items || [];
      setMessages(items);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_conversation', { conversationId });

    const handleReceive = (data: { message: Message }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    };

    const handleBlocked = (data: { message: Message; reason: string }) => {
      toast.error(`消息被拦截：${data.reason}`);
      setMessages((prev) => [...prev, { ...data.message, blocked: true }]);
    };

    const handleTyping = () => {
      setTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
    };

    socket.on('receive_message', handleReceive);
    socket.on('message_blocked', handleBlocked);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('receive_message', handleReceive);
      socket.off('message_blocked', handleBlocked);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    // 优先使用 REST API（更可靠）
    try {
      const res = await chatApi.sendMessage(conversationId, content) as any;
      if (res.blocked) {
        toast.error(`消息被拦截：${res.reason}`);
        setMessages((prev) => [...prev, { ...res.message, blocked: true }]);
      } else if (res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
      }
    } catch (err: any) {
      toast.error(err.message || '发送失败');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {orderTitle && (
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-900">{orderTitle}</h3>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="h-12 w-12 mb-2" />
            <p className="text-sm">暂无消息，发送第一条吧</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === userId}
              />
            ))}
            {typing && (
              <p className="text-xs text-gray-400 ml-10 mb-2">对方正在输入...</p>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
