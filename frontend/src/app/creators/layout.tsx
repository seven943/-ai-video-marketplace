import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '找创作者',
  description: '寻找专业的AI视频创作者，按标签、工具、价格筛选，找到最适合您的视频制作人才。',
  keywords: ['AI视频创作者', '视频制作人', 'AI视频接单', '视频定制', 'Kling', 'Runway', 'Sora'],
  openGraph: {
    title: '找创作者 | AI视频工场',
    description: '寻找专业的AI视频创作者',
  },
};

export default function CreatorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
