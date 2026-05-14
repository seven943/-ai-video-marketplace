import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-bold bg-gradient-to-r from-primary-600 to-violet-500 bg-clip-text text-transparent">
        404
      </div>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        页面不存在
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        你访问的页面可能已被移除或地址有误
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary gap-2">
          <Home className="h-4 w-4" />
          返回首页
        </Link>
        <Link href="/works" className="btn-secondary gap-2">
          <Search className="h-4 w-4" />
          浏览作品
        </Link>
      </div>
    </div>
  );
}
