import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">页面未找到</h2>
      <p className="mt-2 text-sm text-gray-500">抱歉，您访问的页面不存在。</p>
      <Link href="/" className="mt-6 btn-primary">
        返回首页
      </Link>
    </div>
  );
}
