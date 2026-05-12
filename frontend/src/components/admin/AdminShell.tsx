'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, FileCheck, MessageSquare, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { href: '/admin', label: '数据概览', icon: LayoutDashboard },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/orders', label: '订单管理', icon: ShoppingCart },
  { href: '/admin/review', label: '审核中心', icon: FileCheck },
  { href: '/admin/chat', label: '聊天监控', icon: MessageSquare },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    } else if (user?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated() || user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">权限验证中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-primary-100/50 bg-white/60 backdrop-blur-sm md:block">
        <div className="sticky top-16 p-4">
          <Link href="/" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            返回前台
          </Link>
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <link.icon className="h-4.5 w-4.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="w-full md:hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-primary-100/50 bg-white/80 px-3 py-2 backdrop-blur-sm">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="p-4">{children}</div>
      </div>

      {/* Main content */}
      <main className="flex-1 hidden md:block p-6">
        {children}
      </main>
    </div>
  );
}
