import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '需求大厅',
  description: '浏览最新的AI视频制作需求，发布您的视频需求，找到合适的创作者接单。',
  keywords: ['AI视频需求', '视频制作订单', '发布视频需求', '视频外包', 'AI视频接单'],
  openGraph: {
    title: '需求大厅 | AI视频工场',
    description: '浏览最新的AI视频制作需求',
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
