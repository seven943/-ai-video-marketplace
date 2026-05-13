import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HydrateAuth } from '@/components/providers/HydrateAuth';
import { RegisterSW } from '@/components/providers/RegisterSW';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import '@/styles/globals.css';

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'AI视频工场 - 连接AI视频创作者与需求方',
    template: '%s | AI视频工场',
  },
  description: '一站式AI视频供需交易平台，让AI视频创作更简单。专业AI视频创作者为您制作商品展示、品牌宣传、短视频等内容。',
  keywords: ['AI视频', '视频制作', '视频创作', '商品展示视频', '品牌宣传', '短视频制作', 'AI视频工场'],
  metadataBase: new URL('https://ai-video-marketplace-frontend-b1ai.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'AI视频工场',
    title: 'AI视频工场 - 连接AI视频创作者与需求方',
    description: '一站式AI视频供需交易平台，让AI视频创作更简单',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <HydrateAuth />
          <RegisterSW />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
