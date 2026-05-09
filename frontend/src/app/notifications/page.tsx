'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { notificationApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.list({ page: 1, pageSize: 50 }) as any;
      setNotifications(res.items || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary-500" />
          通知中心
        </h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            <CheckCheck className="h-4 w-4" />
            全部已读
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="card divide-y divide-primary-50">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'px-6 py-4 hover:bg-primary-50/30 transition-colors cursor-pointer',
                !n.read && 'bg-primary-50/50'
              )}
              onClick={() => {
                if (!n.read) handleMarkAsRead(n.id);
                if (n.link) window.location.href = n.link;
              }}
            >
              <div className="flex items-start gap-3">
                {!n.read && (
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{n.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(n.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无通知</p>
        </div>
      )}
    </div>
  );
}
