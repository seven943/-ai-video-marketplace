'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, X, FileText } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { orderApi } from '@/lib/api';
import { VIDEO_CATEGORY_LABELS, type VideoCategory } from '@/types';

const categories: VideoCategory[] = [
  'PRODUCT', 'BRAND', 'SHORT_VIDEO', 'EXPLAINER', 'SOCIAL', 'EDUCATION', 'ENTERTAINMENT',
];

export default function CreateOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as VideoCategory | '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    styleRefUrls: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.budgetMin || !form.deadline) {
      toast.error('请填写完整信息');
      return;
    }
    setLoading(true);
    try {
      await orderApi.create({
        title: form.title,
        description: form.description,
        category: form.category,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        deadline: form.deadline,
        styleRefUrls: form.styleRefUrls,
      });
      toast.success('需求发布成功！');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message || '发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回需求大厅
      </Link>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary-500" />
          发布视频需求
        </h1>
        <p className="mt-1 text-sm text-gray-500">填写你的视频需求，让合适的创作者来接单</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">需求标题 <span className="text-red-400">*</span></label>
            <input
              type="text" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="例如：淘宝商品展示视频、品牌宣传片"
              className="input-field mt-1.5" maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">详细描述 <span className="text-red-400">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="详细描述你的视频需求，包括内容、风格、时长、用途等"
              rows={5} className="input-field mt-1.5 resize-none" maxLength={1000}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{form.description.length}/1000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">视频类型 <span className="text-red-400">*</span></label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((cat) => (
                <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    form.category === cat
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25'
                      : 'bg-white/80 text-gray-600 ring-1 ring-primary-100 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  {VIDEO_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">预算范围 (元) <span className="text-red-400">*</span></label>
            <div className="mt-1.5 flex items-center gap-3">
              <input type="number" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} placeholder="最低" className="input-field flex-1" min={0} />
              <span className="text-primary-300 font-medium">—</span>
              <input type="number" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} placeholder="最高" className="input-field flex-1" min={0} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">交付截止日期 <span className="text-red-400">*</span></label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field mt-1.5 w-full sm:w-60" min={new Date().toISOString().split('T')[0]} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">参考图片</label>
            <p className="mt-1 text-xs text-gray-400">上传风格参考图，帮助创作者理解你的需求（最多5张）</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {form.styleRefUrls.map((url, i) => (
                <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl ring-1 ring-primary-100">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, styleRefUrls: form.styleRefUrls.filter((_, idx) => idx !== i) })} className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {form.styleRefUrls.length < 5 && (
                <button type="button" className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-200 text-primary-400 transition-colors hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50">
                  <Upload className="h-5 w-5" /><span className="mt-1 text-xs">上传</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 border-t border-primary-100 pt-6">
            <Link href="/orders" className="btn-secondary flex-1 text-center">取消</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '发布需求'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
