import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HydrateAuth } from '@/components/providers/HydrateAuth';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'AI视频工场 - 连接AI视频创作者与需求方',
  description: '一站式AI视频供需交易平台，让AI视频创作更简单',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <HydrateAuth />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
