import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '成为创作者',
  description: '注册成为AI视频创作者，展示您的作品，接受视频制作订单，开启AI视频创作之旅。',
  keywords: ['成为创作者', 'AI视频创作者注册', '视频接单', 'AI视频创作'],
};

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
