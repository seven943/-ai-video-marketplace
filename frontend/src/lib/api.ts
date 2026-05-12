import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：注入 token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截：统一错误处理
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message: string }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '网络错误';

    if (status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

// ========== 用户 ==========
export const userApi = {
  login: (phone: string, code: string) =>
    api.post('/auth/login', { phone, code }),
  sendCode: (phone: string) =>
    api.post('/auth/send-code', { phone }),
  getProfile: () =>
    api.get('/user/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    api.patch('/user/profile', data),
};

// ========== 作品 ==========
export const worksApi = {
  list: (params?: { category?: string; page?: number; pageSize?: number }) =>
    api.get('/works', { params }),
  detail: (id: string) =>
    api.get(`/works/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post('/works', data),
  like: (id: string) =>
    api.post(`/works/${id}/like`),
};

// ========== 订单 ==========
export const orderApi = {
  list: (params?: { status?: string; page?: number; pageSize?: number }) =>
    api.get('/orders', { params }),
  detail: (id: string) =>
    api.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post('/orders', data),
  accept: (id: string) =>
    api.post(`/orders/${id}/accept`),
  submitQuote: (id: string, data: { quotedPrice: number; quotedDeadline: string }) =>
    api.post(`/orders/${id}/submit-quote`, data),
  acceptQuote: (id: string) =>
    api.post(`/orders/${id}/accept-quote`),
  rejectQuote: (id: string) =>
    api.post(`/orders/${id}/reject-quote`),
  start: (id: string) =>
    api.post(`/orders/${id}/start`),
  deliver: (id: string) =>
    api.post(`/orders/${id}/deliver`),
  complete: (id: string) =>
    api.post(`/orders/${id}/complete`),
  requestRevision: (id: string) =>
    api.post(`/orders/${id}/request-revision`),
  cancel: (id: string) =>
    api.post(`/orders/${id}/cancel`),
  recommendations: (id: string) =>
    api.get(`/orders/${id}/recommendations`),
};

// ========== 评价 ==========
export const reviewApi = {
  create: (data: { orderId: string; rating: number; content: string }) =>
    api.post('/reviews', data),
  list: (params?: { targetId?: string; orderId?: string; page?: number; pageSize?: number }) =>
    api.get('/reviews', { params }),
};

// ========== 创作者 ==========
export const creatorApi = {
  list: (params?: { tags?: string; page?: number; pageSize?: number }) =>
    api.get('/creators', { params }),
  detail: (id: string) =>
    api.get(`/creators/${id}`),
  register: (data: Record<string, unknown>) =>
    api.post('/creators/register', data),
  updateProfile: (data: Record<string, unknown>) =>
    api.patch('/creators/profile', data),
  dashboard: () =>
    api.get('/dashboard/creator'),
};

// ========== 支付 ==========
export const payApi = {
  create: (orderId: string, method: 'WECHAT' | 'ALIPAY') =>
    api.post('/payment/create', { orderId, method }),
  simulatePay: (paymentId: string) =>
    api.post(`/payment/${paymentId}/simulate-pay`),
  getByOrder: (orderId: string) =>
    api.get(`/payment/order/${orderId}`),
  status: (paymentId: string) =>
    api.get(`/payment/${paymentId}/status`),
};

// ========== 上传 ==========
export const uploadApi = {
  image: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  video: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/video', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ========== 通知 ==========
export const notificationApi = {
  list: (params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),
  unreadCount: () =>
    api.get('/notifications/unread-count'),
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.post('/notifications/read-all'),
};

// ========== 聊天 ==========
export const chatApi = {
  conversations: () =>
    api.get('/chat/conversations'),
  messages: (convId: string, params?: { page?: number }) =>
    api.get(`/chat/conversations/${convId}/messages`, { params }),
  sendMessage: (convId: string, content: string, type?: string) =>
    api.post(`/chat/conversations/${convId}/messages`, { content, type }),
  unreadCount: () =>
    api.get('/chat/unread-count'),
  getOrCreateDirect: (creatorId: string) =>
    api.post('/chat/conversations/direct', { creatorId }),
  adminConversations: (params?: { page?: number; pageSize?: number }) =>
    api.get('/chat/admin/conversations', { params }),
  adminMessages: (params?: { page?: number; pageSize?: number }) =>
    api.get('/chat/admin/messages', { params }),
  adminBlocked: (params?: { page?: number; pageSize?: number }) =>
    api.get('/chat/admin/blocked', { params }),
};

// ========== 管理后台 ==========
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params?: { page?: number; pageSize?: number; role?: string; keyword?: string }) =>
    api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  orders: (params?: { page?: number; pageSize?: number; status?: string; keyword?: string }) =>
    api.get('/admin/orders', { params }),
};
