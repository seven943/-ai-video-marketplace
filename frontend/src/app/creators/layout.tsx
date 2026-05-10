import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '找创作者',
  description: '寻找专业的AI视频创作者，按标签、工具、价格筛选，找到最适合您的视频制作人才。',
  openGraph: {
    title: '找创作者 | AI视频工场',
    description: '寻找专业的AI视频创作者',
  },
};

export default function CreatorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
