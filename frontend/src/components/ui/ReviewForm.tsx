'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewApi } from '@/lib/api';

interface ReviewFormProps {
  orderId: string;
  onSuccess: () => void;
}

export function ReviewForm({ orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('请选择评分');
      return;
    }
    setLoading(true);
    try {
      await reviewApi.create({ orderId, rating, content });
      toast.success('评价提交成功');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || '评价失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">评价创作者</h3>

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {rating > 0 ? ['很差', '较差', '一般', '满意', '非常满意'][rating - 1] : '点击评分'}
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="分享你的合作体验..."
        rows={4}
        className="input-field resize-none w-full"
        maxLength={500}
      />
      <p className="mt-1 text-right text-xs text-gray-400">{content.length}/500</p>

      <button type="submit" disabled={loading} className="btn-primary mt-3 w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '提交评价'}
      </button>
    </form>
  );
}
