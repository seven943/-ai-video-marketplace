'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, X, Video, Image as ImageIcon, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { worksApi, uploadApi } from '@/lib/api';
import { VIDEO_CATEGORY_LABELS, type VideoCategory } from '@/types';

const categories: VideoCategory[] = [
  'PRODUCT', 'BRAND', 'SHORT_VIDEO', 'EXPLAINER', 'SOCIAL', 'EDUCATION', 'ENTERTAINMENT', 'OTHER',
];

export default function CreateWorkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: '' as VideoCategory | '',
    tags: '',
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !videoFile) {
      toast.error('请填写完整信息并上传视频');
      return;
    }
    setLoading(true);
    try {
      // 上传封面图
      let coverUrl = '';
      if (coverFile) {
        setUploadProgress('上传封面图...');
        const coverRes = await uploadApi.image(coverFile) as any;
        coverUrl = coverRes.url;
      }

      // 上传视频
      setUploadProgress('上传视频...');
      const videoRes = await uploadApi.video(videoFile) as any;
      const videoUrl = videoRes.url;

      // 创建作品
      setUploadProgress('发布作品...');
      const tags = form.tags.split(/[,，、\s]+/).filter(Boolean);
      await worksApi.create({
        title: form.title,
        coverUrl,
        videoUrl,
        category: form.category,
        tags,
      } as any);

      toast.success('作品发布成功！');
      router.push('/works');
    } catch (err: any) {
      toast.error(err.message || '发布失败');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/works" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回作品列表
      </Link>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary-500" />
          发布作品
        </h1>
        <p className="mt-1 text-sm text-gray-500">上传你的 AI 视频作品，展示给更多人</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              作品标题 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="给你的作品起个好名字"
              className="input-field mt-1.5"
              maxLength={50}
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              视频类型 <span className="text-red-400">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
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

          {/* 封面图 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">封面图</label>
            <p className="mt-1 text-xs text-gray-400">推荐 16:9 比例，支持 JPG/PNG/WebP</p>
            <div className="mt-3">
              {coverPreview ? (
                <div className="relative inline-block">
                  <img src={coverPreview} alt="封面预览" className="h-40 w-72 rounded-xl object-cover ring-1 ring-primary-100" />
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); setCoverPreview(''); }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex h-40 w-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-200 text-primary-400 transition-colors hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50">
                  <ImageIcon className="h-8 w-8" />
                  <span className="mt-2 text-sm">点击上传封面</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* 视频 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              视频文件 <span className="text-red-400">*</span>
            </label>
            <p className="mt-1 text-xs text-gray-400">支持 MP4/MOV/WebM，最大 500MB</p>
            <div className="mt-3">
              {videoPreview ? (
                <div className="relative inline-block">
                  <video src={videoPreview} className="h-40 w-72 rounded-xl object-cover ring-1 ring-primary-100" controls />
                  <button
                    type="button"
                    onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <p className="mt-1 text-xs text-gray-400">{videoFile?.name} ({(videoFile!.size / 1024 / 1024).toFixed(1)}MB)</p>
                </div>
              ) : (
                <label className="flex h-40 w-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-200 text-primary-400 transition-colors hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50">
                  <Video className="h-8 w-8" />
                  <span className="mt-2 text-sm">点击上传视频</span>
                  <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">标签</label>
            <p className="mt-1 text-xs text-gray-400">用逗号分隔，帮助别人找到你的作品</p>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="例如：AI视频, 产品展示, 品牌宣传"
              className="input-field mt-1.5"
            />
          </div>

          {/* 提交 */}
          <div className="flex gap-3 border-t border-primary-100 pt-6">
            <Link href="/works" className="btn-secondary flex-1 text-center">取消</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadProgress || '发布中...'}
                </span>
              ) : '发布作品'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
