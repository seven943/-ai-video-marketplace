import Link from 'next/link';
import type { Metadata } from 'next';
import { Video, Sparkles, Shield, Zap, ArrowRight, Play, Star, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI视频工场 - 连接AI视频创作者与需求方',
  description: '一站式AI视频供需交易平台，汇聚专业AI视频创作者，提供商品展示、品牌宣传、短视频等AI视频制作服务。担保交易，验收后付款。',
  openGraph: {
    title: 'AI视频工场 - 连接AI视频创作者与需求方',
    description: '一站式AI视频供需交易平台，让AI视频创作更简单',
  },
};

const features = [
  {
    icon: Sparkles,
    title: 'AI赋能创作',
    description: '集成主流AI视频工具，降低创作门槛，让每个人都能制作专业视频',
    gradient: 'from-primary-500 to-violet-500',
  },
  {
    icon: Shield,
    title: '担保交易',
    description: '资金托管，验收后付款，保障买卖双方权益',
    gradient: 'from-accent-500 to-pink-500',
  },
  {
    icon: Zap,
    title: '高效匹配',
    description: '智能推荐系统，快速匹配需求与创作者，缩短交付周期',
    gradient: 'from-rose-500 to-orange-500',
  },
];

const categories = [
  { name: '商品展示', key: 'PRODUCT', icon: '📦' },
  { name: '品牌宣传', key: 'BRAND', icon: '🎬' },
  { name: '短视频', key: 'SHORT_VIDEO', icon: '📱' },
  { name: '解说视频', key: 'EXPLAINER', icon: '🎤' },
  { name: '教育培训', key: 'EDUCATION', icon: '📚' },
  { name: '社交媒体', key: 'SOCIAL', icon: '✨' },
];

const stats = [
  { label: '创作者', value: '2,000+', icon: Users },
  { label: '作品数', value: '15,000+', icon: Play },
  { label: '满意度', value: '98%', icon: Star },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI视频工场',
  url: 'https://ai-video-marketplace-frontend-b1ai.vercel.app',
  description: '一站式AI视频供需交易平台，连接AI视频创作者与需求方',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://ai-video-marketplace-frontend-b1ai.vercel.app/works?keyword={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-200/60 to-transparent blur-3xl" />
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-violet-200/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-4 py-1.5 text-sm font-medium text-primary-700 ring-1 ring-primary-200/60 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              AI驱动的视频创作新时代
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              AI视频
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500 bg-clip-text text-transparent">
                供需平台
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
              连接AI视频创作者与需求方。发布需求，找到创作者，用AI技术高效交付专业视频。
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/orders" className="btn-primary text-base px-8 py-3 gap-2">
                发布需求
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/works" className="btn-secondary text-base px-8 py-3">
                浏览作品
              </Link>
            </div>

            <div className="mx-auto mt-16 flex max-w-lg items-center justify-center gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{stat.value}</div>
                  <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">为什么选择AI视频工场</h2>
            <p className="mt-3 text-gray-500">一站式解决AI视频创作与交易的所有需求</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card card-hover text-center p-8">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} shadow-lg`}>
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-100/40 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">热门视频类型</h2>
            <p className="mt-3 text-gray-500">探索不同类型的AI视频作品</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={`/works?category=${cat.key}`}
                className="card card-hover group flex flex-col items-center p-6"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">三步开始</h2>
            <p className="mt-3 text-gray-500">简单三步，完成AI视频交易</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: '01', title: '发布需求', desc: '描述你的视频需求、风格偏好和预算范围' },
              { step: '02', title: '匹配创作者', desc: '平台智能推荐合适的AI视频创作者接单' },
              { step: '03', title: '验收交付', desc: '确认视频质量，满意后释放付款' },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-lg font-bold text-white shadow-lg shadow-primary-500/20">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRhMiAyIDAgMSAxLTQgMCAyIDIgMCAwIDEgNCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">准备好开始了吗？</h2>
          <p className="mt-4 text-lg text-white/80">
            无论你是需要AI视频的甲方，还是擅长AI创作的创作者，这里都是你的舞台。
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register" className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-primary-600 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all">
              立即注册
            </Link>
            <Link href="/works" className="rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition-all">
              查看作品
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
