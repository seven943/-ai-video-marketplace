'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Smartphone, CreditCard } from 'lucide-react';
import { payApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  orderId: string;
  amount: number;
  isDeposit?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ orderId, amount, isDeposit, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<'WECHAT' | 'ALIPAY'>('WECHAT');
  const [step, setStep] = useState<'select' | 'paying' | 'success'>('select');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePay = async () => {
    setLoading(true);
    try {
      const payment = await payApi.create(orderId, method) as any;
      await payApi.simulatePay(payment.id);
      setStep('success');
      toast.success('支付成功！');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || '支付失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={isDeposit ? '支付定金' : '确认支付'}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="关闭"
          className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'select' && (
          <>
            <h2 className="text-xl font-bold text-gray-900">{isDeposit ? '支付定金' : '确认支付'}</h2>
            <p className="mt-1 text-sm text-gray-500">{isDeposit ? '支付报价10%的定金，资金将托管至订单完成' : '选择支付方式完成订单支付'}</p>

            <div className="mt-6 rounded-xl bg-primary-50 p-4 text-center">
              <p className="text-sm text-gray-500">{isDeposit ? '定金金额' : '支付金额'}</p>
              <p className="mt-1 text-3xl font-bold text-primary-600">
                ¥{amount.toLocaleString()}
              </p>
              {isDeposit && <p className="mt-1 text-xs text-gray-400">报价的10%，剩余90%验收后结算</p>}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-gray-700">支付方式</p>
              <button
                onClick={() => setMethod('WECHAT')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all',
                  method === 'WECHAT'
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">微信支付</p>
                  <p className="text-xs text-gray-500">推荐使用微信扫码支付</p>
                </div>
              </button>

              <button
                onClick={() => setMethod('ALIPAY')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all',
                  method === 'ALIPAY'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">支付宝</p>
                  <p className="text-xs text-gray-500">支持支付宝扫码支付</p>
                </div>
              </button>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="btn-primary mt-6 w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  支付中...
                </span>
              ) : (
                `确认支付 ¥${amount.toLocaleString()}`
              )}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              模拟支付：点击后将直接完成支付
            </p>
          </>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">支付成功</h2>
            <p className="mt-2 text-sm text-gray-500">
              ¥{amount.toLocaleString()} 已支付{isDeposit ? '（定金）' : ''}，资金将托管至订单完成
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
