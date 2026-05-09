import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: string, method: PaymentMethod, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.buyerId !== userId) throw new BadRequestException('无权操作');
    if (order.status !== 'MATCHED') throw new BadRequestException('订单状态不正确');

    // 检查是否已有支付记录
    const existing = await this.prisma.payment.findUnique({ where: { orderId } });
    if (existing && existing.status === 'PAID') {
      throw new BadRequestException('已支付');
    }

    const amount = order.budgetMax; // MVP 阶段按最高预算

    // 创建支付记录（MVP 阶段模拟支付成功）
    const payment = await this.prisma.payment.upsert({
      where: { orderId },
      create: { orderId, amount, method, status: 'PAID' },
      update: { amount, method, status: 'PAID' },
    });

    // 更新订单状态
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' },
    });

    return {
      ...payment,
      // TODO: 返回真实的支付链接
      payUrl: method === 'WECHAT' ? 'weixin://...' : 'alipay://...',
    };
  }

  async release(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('支付记录不存在');
    if (payment.status !== 'PAID') throw new BadRequestException('状态不正确');

    return this.prisma.payment.update({
      where: { orderId },
      data: { status: 'RELEASED' },
    });
  }

  async refund(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('支付记录不存在');
    if (!['PENDING', 'PAID'].includes(payment.status)) {
      throw new BadRequestException('无法退款');
    }

    return this.prisma.payment.update({
      where: { orderId },
      data: { status: 'REFUNDED' },
    });
  }

  async getStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('支付记录不存在');
    return payment;
  }
}
