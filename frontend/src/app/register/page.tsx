'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) { toast.error('请输入正确的手机号'); return; }
    try {
      await userApi.sendCode(phone);
      setCountdown(60);
      toast.success('验证码已发送');
      const timer = setInterval(() => {
        setCountdown((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
      }, 1000);
    } catch { toast.error('发送验证码失败'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !code) return;
    setLoading(true);
    try {
      const res = await userApi.login(phone, code) as any;
      setAuth(res.user, res.token);
      toast.success('注册成功！');
      router.push('/');
    } catch (err: any) { toast.error(err.message || '注册失败'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg">
              <Video className="h-7 w-7 text-white" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">注册 AI视频工场</h2>
            <p className="mt-2 text-sm text-gray-500">创建账号，开始你的AI视频之旅</p>
          </div>

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">手机号</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" className="input-field mt-1.5" maxLength={11} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">验证码</label>
              <div className="mt-1.5 flex gap-2">
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入验证码" className="input-field flex-1" maxLength={6} />
                <button type="button" onClick={sendCode} disabled={countdown > 0} className="btn-secondary whitespace-nowrap">
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !phone || !code} className="btn-primary w-full py-3">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '注册并登录'}
            </button>

            <p className="text-center text-xs text-gray-400">
              注册即表示同意<Link href="/terms" className="text-primary-600 hover:underline">服务条款</Link>和<Link href="/privacy" className="text-primary-600 hover:underline">隐私政策</Link>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            已有账号？<Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">立即登录</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" />AI驱动的视频创作新时代
        </p>
      </div>
    </div>
  );
}
