'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Plus, X, User, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { creatorApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const TAG_OPTIONS = [
  '商品展示', '品牌宣传', '短视频', '解说视频', '社交媒体', '教育培训', '娱乐创意',
  '产品评测', '直播切片', '动画制作', '特效合成', '口播视频',
];

const AI_TOOL_OPTIONS = [
  'Kling', 'Runway', 'Flux', 'Pika', 'Sora', 'HeyGen', 'Synthesia',
  'D-ID', 'CapCut', 'Stable Diffusion', 'Midjourney', 'ComfyUI',
];

const STATUS_OPTIONS = [
  { value: 'ONLINE', label: '在线接单', color: 'bg-green-100 text-green-700 ring-green-200' },
  { value: 'BUSY', label: '忙碌', color: 'bg-yellow-100 text-yellow-700 ring-yellow-200' },
  { value: 'OFFLINE', label: '离线', color: 'bg-gray-100 text-gray-500 ring-gray-200' },
];

export default function EditCreatorPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    tags: [] as string[],
    aiTools: [] as string[],
    priceMin: '',
    priceMax: '',
    portfolioUrls: [] as string[],
    status: 'ONLINE',
  });
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await userApi.getProfile() as any;
        if (res.creatorProfile) {
          const p = res.creatorProfile;
          setForm({
            bio: p.bio || '',
            tags: p.tags || [],
            aiTools: p.aiTools || [],
            priceMin: p.priceMin?.toString() || '',
            priceMax: p.priceMax?.toString() || '',
            portfolioUrls: p.portfolioUrls || [],
            status: p.status || 'ONLINE',
          });
        }
      } catch {
        toast.error('加载资料失败');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const toggleTool = (tool: string) => {
    setForm((f) => ({
      ...f,
      aiTools: f.aiTools.includes(tool) ? f.aiTools.filter((t) => t !== tool) : [...f.aiTools, tool],
    }));
  };

  const addPortfolioUrl = () => {
    if (!newPortfolioUrl.trim()) return;
    if (form.portfolioUrls.length >= 5) {
      toast.error('最多添加5个作品集链接');
      return;
    }
    setForm((f) => ({ ...f, portfolioUrls: [...f.portfolioUrls, newPortfolioUrl.trim()] }));
    setNewPortfolioUrl('');
  };

  const removePortfolioUrl = (idx: number) => {
    setForm((f) => ({ ...f, portfolioUrls: f.portfolioUrls.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bio.trim()) {
      toast.error('请填写个人简介');
      return;
    }
    setSaving(true);
    try {
      await creatorApi.updateProfile({
        bio: form.bio,
        tags: form.tags,
        aiTools: form.aiTools,
        priceMin: form.priceMin ? Number(form.priceMin) : 0,
        priceMax: form.priceMax ? Number(form.priceMax) : 0,
        portfolioUrls: form.portfolioUrls,
        status: form.status,
      });
      toast.success('资料更新成功！');
      router.push(`/creators/${user?.id}`);
    } catch (err: any) {
      toast.error(err.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/creators/${user?.id || ''}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回我的主页
      </Link>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 text-primary-500" />
          编辑创作者资料
        </h1>
        <p className="mt-1 text-sm text-gray-500">完善你的个人资料，让更多买家找到你</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">个人简介 <span className="text-red-400">*</span></label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="介绍你的专业背景、擅长领域、服务过的客户等"
              rows={4}
              className="input-field mt-1.5 resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{form.bio.length}/500</p>
          </div>

          {/* 接单状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">接单状态</label>
            <div className="mt-2 flex gap-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: opt.value })}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium ring-1 transition-all',
                    form.status === opt.value ? opt.color : 'bg-white text-gray-500 ring-gray-200 hover:bg-gray-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 擅长标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">擅长标签</label>
            <p className="mt-1 text-xs text-gray-400">选择你擅长的视频类型（可多选）</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
                    form.tags.includes(tag)
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-primary-50 hover:text-primary-600'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* AI 工具 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">使用的 AI 工具</label>
            <p className="mt-1 text-xs text-gray-400">选择你常用的 AI 视频工具（可多选）</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {AI_TOOL_OPTIONS.map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
                    form.aiTools.includes(tool)
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-purple-50 hover:text-purple-600'
                  )}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* 报价范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">报价范围（元）</label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                type="number"
                value={form.priceMin}
                onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
                placeholder="最低"
                className="input-field flex-1"
                min={0}
              />
              <span className="text-primary-300 font-medium">—</span>
              <input
                type="number"
                value={form.priceMax}
                onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                placeholder="最高"
                className="input-field flex-1"
                min={0}
              />
            </div>
          </div>

          {/* 作品集链接 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">作品集链接</label>
            <p className="mt-1 text-xs text-gray-400">添加外部作品集链接，如 B站、抖音、YouTube 等（最多5个）</p>
            <div className="mt-2 space-y-2">
              {form.portfolioUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="input-field flex-1 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => removePortfolioUrl(i)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {form.portfolioUrls.length < 5 && (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newPortfolioUrl}
                    onChange={(e) => setNewPortfolioUrl(e.target.value)}
                    placeholder="https://..."
                    className="input-field flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPortfolioUrl(); } }}
                  />
                  <button
                    type="button"
                    onClick={addPortfolioUrl}
                    className="btn-secondary flex items-center gap-1 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    添加
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 提交 */}
          <div className="flex gap-3 border-t border-primary-100 pt-6">
            <Link href={`/creators/${user?.id || ''}`} className="btn-secondary flex-1 text-center">取消</Link>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
