import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '浏览作品',
  description: '浏览AI视频创作者的优秀作品，涵盖商品展示、品牌宣传、短视频、解说视频等多种类型。',
  openGraph: {
    title: '浏览作品 | AI视频工场',
    description: '浏览AI视频创作者的优秀作品',
  },
};

export default function WorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
