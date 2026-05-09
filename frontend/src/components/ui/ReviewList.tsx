'use client';

import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  reviewer?: {
    id: string;
    nickname: string;
    avatar: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        暂无评价
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-medium">
                {review.reviewer?.nickname?.[0] || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {review.reviewer?.nickname || '匿名用户'}
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          {review.content && (
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
