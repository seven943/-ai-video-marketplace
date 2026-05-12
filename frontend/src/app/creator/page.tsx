'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, Loader2, Zap, Star, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { creatorApi } from '@/lib/api';
import { TAG_OPTIONS, AI_TOOL_OPTIONS } from '@/lib/constants';

export default function CreatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    tags: [] as string[],
    aiTools: [] as string[],
    priceMin: '',
    priceMax: '',
  });

  const toggleItem = (field: 'tags' | 'aiTools', value: string) => {
    const current = form[field];
    setForm({
      ...form,
      [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.tags.length === 0) { toast.error('请至少选择一个擅长领域'); return; }
    setLoading(true);
    try {
      await creatorApi.register({
        bio: form.bio,
        tags: form.tags,
        aiTools: form.aiTools,
        priceMin: form.priceMin ? Number(form.priceMin) : 0,
        priceMax: form.priceMax ? Number(form.priceMax) : 0,
      });
      toast.success('注册成功！欢迎成为创作者');
      router.push('/profile');
    } catch (err: any) { toast.error(err.message || '注册失败，请重试'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100/80 via-primary-50 to-accent-50 p-8 text-center ring-1 ring-primary-200/50">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent-200/40 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-primary-300/30 blur-3xl" />
        </div>
        <Sparkles className="mx-auto h-12 w-12 text-primary-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">成为 AI 视频创作者</h1>
        <p className="mt-2 text-sm text-gray-600">注册成为创作者，开始接单赚取收入。AI工具让视频创作更简单。</p>

        <div className="mt-6 flex justify-center gap-6">
          {[
            { icon: Zap, label: '低门槛' },
            { icon: Star, label: '高收入' },
            { icon: TrendingUp, label: '好前景' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-sm text-primary-700">
              <item.icon className="h-4 w-4" />{item.label}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">个人简介</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="介绍一下你的创作经验和擅长领域" rows={4} className="input-field mt-1.5 resize-none" maxLength={500} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">擅长领域 <span className="text-red-400">*</span></label>
            <p className="mt-1 text-xs text-gray-400">选择你擅长的视频类型（可多选）</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleItem('tags', tag)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    form.tags.includes(tag)
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25'
                      : 'bg-white/80 text-gray-600 ring-1 ring-primary-100 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  {form.tags.includes(tag) && <Check className="h-3.5 w-3.5" />}{tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">常用 AI 工具</label>
            <p className="mt-1 text-xs text-gray-400">选择你使用的AI视频/图片生成工具</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AI_TOOL_OPTIONS.map((tool) => (
                <button key={tool} type="button" onClick={() => toggleItem('aiTools', tool)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    form.aiTools.includes(tool)
                      ? 'bg-gradient-to-r from-accent-500 to-pink-500 text-white shadow-md shadow-accent-500/25'
                      : 'bg-white/80 text-gray-600 ring-1 ring-primary-100 hover:bg-accent-50 hover:text-accent-600'
                  }`}
                >
                  {form.aiTools.includes(tool) && <Check className="h-3.5 w-3.5" />}{tool}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">报价范围 (元/单)</label>
            <div className="mt-1.5 flex items-center gap-3">
              <input type="number" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} placeholder="最低" className="input-field flex-1" min={0} />
              <span className="text-primary-300 font-medium">—</span>
              <input type="number" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} placeholder="最高" className="input-field flex-1" min={0} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '注册成为创作者'}
        </button>
      </form>
    </div>
  );
}
