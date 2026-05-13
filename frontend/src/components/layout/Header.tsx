'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Video, User, LogOut, ShieldCheck, MessageSquare, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navLinks = [
  { href: '/works', label: '浏览作品' },
  { href: '/creators', label: '找创作者' },
  { href: '/orders', label: '需求大厅' },
  { href: '/creator', label: '成为创作者' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/60 bg-white/70 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Video className="h-7 w-7 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">AI视频工场</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <Link
                href="/admin/review"
                className="flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                <ShieldCheck className="h-4 w-4" />
                审核中心
              </Link>
              <Link
                href="/admin/chat"
                className="flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                <MessageSquare className="h-4 w-4" />
                聊天监控
              </Link>
            </>
          )}
          {isAuthenticated() && (user?.role === 'CREATOR' || user?.role === 'BOTH' || isAdmin) && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
            >
              <BarChart3 className="h-4 w-4" />
              数据看板
            </Link>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated() ? (
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/chat" className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <NotificationBell />
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
              >
                <User className="h-4 w-4" />
                {user?.nickname || '我的'}
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/login" className="btn-secondary text-sm">
                登录
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                免费注册
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-gray-600"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <Link href="/admin/review" className="flex items-center gap-2 py-2 text-sm text-primary-600" onClick={() => setMobileOpen(false)}>
                <ShieldCheck className="h-4 w-4" /> 审核中心
              </Link>
              <Link href="/admin/chat" className="flex items-center gap-2 py-2 text-sm text-primary-600" onClick={() => setMobileOpen(false)}>
                <MessageSquare className="h-4 w-4" /> 聊天监控
              </Link>
            </>
          )}
          {isAuthenticated() && (user?.role === 'CREATOR' || user?.role === 'BOTH' || isAdmin) && (
            <Link href="/dashboard" className="flex items-center gap-2 py-2 text-sm text-gray-600" onClick={() => setMobileOpen(false)}>
              <BarChart3 className="h-4 w-4" /> 数据看板
            </Link>
          )}
          {isAuthenticated() && (
            <>
              <Link href="/chat" className="flex items-center gap-2 py-2 text-sm text-gray-600" onClick={() => setMobileOpen(false)}>
                <MessageSquare className="h-4 w-4" /> 聊天
              </Link>
              <Link href="/notifications" className="flex items-center gap-2 py-2 text-sm text-gray-600" onClick={() => setMobileOpen(false)}>
                通知
              </Link>
              <Link href="/profile" className="flex items-center gap-2 py-2 text-sm text-gray-600" onClick={() => setMobileOpen(false)}>
                <User className="h-4 w-4" /> 个人中心
              </Link>
            </>
          )}
          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
            {isAuthenticated() ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="btn-secondary text-sm">
                退出登录
              </button>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm" onClick={() => setMobileOpen(false)}>
                  登录
                </Link>
                <Link href="/register" className="btn-primary text-sm" onClick={() => setMobileOpen(false)}>
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
