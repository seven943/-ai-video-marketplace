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

    // 支持两种流程：
    // 1. 新流程：QUOTE_ACCEPTED → 支付10%定金
    // 2. 旧流程：MATCHED → 支付全额
    if (!['MATCHED', 'QUOTE_ACCEPTED'].includes(order.status)) {
      throw new BadRequestException('订单状态不正确，需等待匹配后才能支付');
    }

    // 检查是否已有支付记录
    const existing = await this.prisma.payment.findUnique({ where: { orderId } });
    if (existing && existing.status !== 'PENDING') {
      throw new BadRequestException('该订单已有支付记录');
    }

    // 计算金额：
    // 有报价 → 报价的10%定金
    // 无报价 → 预算中间值全额
    let amount: number;
    if (order.quotedPrice) {
      amount = Math.round(order.quotedPrice * 0.1);
    } else {
      amount = Math.round((order.budgetMin + order.budgetMax) / 2);
    }

    const payment = await this.prisma.payment.upsert({
      where: { orderId },
      create: { orderId, amount, method, status: 'PENDING' },
      update: { amount, method, status: 'PENDING' },
    });

    return payment;
  }

  async simulatePay(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('支付记录不存在');
    if (payment.order.buyerId !== userId) throw new BadRequestException('无权操作');
    if (payment.status !== 'PENDING') throw new BadRequestException('支付状态不正确');

    // 模拟支付成功
    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'PAID' },
    });

    // 更新订单状态为 IN_PROGRESS
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'IN_PROGRESS' },
    });

    return updated;
  }

  async getByOrder(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } });
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
