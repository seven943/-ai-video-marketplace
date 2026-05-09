import Link from 'next/link';
import { Video, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-primary-100/50 bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
                <Video className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">AI视频工场</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              连接AI视频创作者与需求方，让视频创作更简单高效。
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">平台</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/works" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">浏览作品</Link></li>
              <li><Link href="/orders" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">需求大厅</Link></li>
              <li><Link href="/creator" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">成为创作者</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">支持</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/help" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">帮助中心</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">服务条款</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">隐私政策</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">联系我们</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-gray-500">邮箱：support@aivideo.com</li>
              <li className="text-sm text-gray-500">微信：AI视频工场</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-100/50 pt-8 flex items-center justify-center gap-1 text-sm text-gray-400">
          © {new Date().getFullYear()} AI视频工场 · Made with <Heart className="h-3.5 w-3.5 text-primary-400 fill-primary-400" /> by AI
        </div>
      </div>
    </footer>
  );
}
