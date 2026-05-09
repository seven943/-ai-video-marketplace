// ========== 用户 ==========
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  role: 'BUYER' | 'CREATOR' | 'BOTH' | 'ADMIN';
  creditScore: number;
  createdAt: string;
}

export interface CreatorProfile {
  userId: string;
  bio: string;
  tags: string[];
  portfolioUrls: string[];
  aiTools: string[];
  priceRange: { min: number; max: number };
  status: 'online' | 'busy' | 'offline';
  rating: number;
  orderCount: number;
}

// ========== 作品 ==========
export interface Work {
  id: string;
  creatorId: string;
  creator?: User;
  title: string;
  coverUrl: string;
  videoUrl: string;
  category: VideoCategory;
  tags: string[];
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

export type VideoCategory =
  | 'PRODUCT'      // 商品展示
  | 'BRAND'        // 品牌宣传
  | 'SHORT_VIDEO'  // 短视频
  | 'EXPLAINER'    // 解说视频
  | 'SOCIAL'       // 社交媒体
  | 'EDUCATION'    // 教育培训
  | 'ENTERTAINMENT' // 娱乐创意
  | 'OTHER';       // 其他

export const VIDEO_CATEGORY_LABELS: Record<VideoCategory, string> = {
  PRODUCT: '商品展示',
  BRAND: '品牌宣传',
  SHORT_VIDEO: '短视频',
  EXPLAINER: '解说视频',
  SOCIAL: '社交媒体',
  EDUCATION: '教育培训',
  ENTERTAINMENT: '娱乐创意',
  OTHER: '其他',
};

// ========== 订单 ==========
export interface Order {
  id: string;
  buyerId: string;
  buyer?: User;
  creatorId?: string;
  creator?: User;
  title: string;
  description: string;
  category: VideoCategory;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  styleRefUrls: string[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'      // 待匹配
  | 'MATCHED'      // 已匹配
  | 'IN_PROGRESS'  // 制作中
  | 'REVIEWING'    // 审核中
  | 'REVISION'     // 修改中
  | 'COMPLETED'    // 已完成
  | 'CANCELLED';   // 已取消

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '待匹配',
  MATCHED: '已匹配',
  IN_PROGRESS: '制作中',
  REVIEWING: '审核中',
  REVISION: '修改中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  MATCHED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  REVIEWING: 'bg-orange-100 text-orange-800',
  REVISION: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

// ========== 支付 ==========
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'paid' | 'released' | 'refunded';
  method: 'wechat' | 'alipay';
  createdAt: string;
}

// ========== 评价 ==========
export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  targetId: string;
  rating: number;
  content: string;
  createdAt: string;
}

// ========== API ==========
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
