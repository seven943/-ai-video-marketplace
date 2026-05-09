import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { OrderStatus, VideoCategory } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  async list(params: { status?: string; page?: number; pageSize?: number }) {
    const { status, page = 1, pageSize = 20 } = params;
    const where: any = {};
    if (status) where.status = status as OrderStatus;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          buyer: { select: { id: true, nickname: true, avatar: true } },
          creator: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async detail(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, nickname: true, avatar: true } },
        creator: { select: { id: true, nickname: true, avatar: true } },
        payment: true,
        reviews: true,
      },
    });
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  async create(userId: string, data: {
    title: string;
    description: string;
    category: VideoCategory;
    budgetMin: number;
    budgetMax: number;
    deadline: string;
    styleRefUrls?: string[];
  }) {
    return this.prisma.order.create({
      data: {
        buyerId: userId,
        ...data,
        deadline: new Date(data.deadline),
      },
    });
  }

  async accept(orderId: string, creatorId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 'PENDING') throw new BadRequestException('该订单已被接单');
    if (order.buyerId === creatorId) throw new ForbiddenException('不能接自己的单');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { creatorId, status: 'MATCHED' },
    });

    await this.notification.create({
      userId: order.buyerId,
      type: 'ORDER_STATUS',
      title: '订单已被接单',
      content: `您的订单「${order.title}」已被创作者接单`,
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  async startWork(orderId: string, creatorId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.creatorId !== creatorId) throw new ForbiddenException('无权操作');
    if (order.status !== 'MATCHED') throw new BadRequestException('订单状态不正确');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  async deliver(orderId: string, creatorId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.creatorId !== creatorId) throw new ForbiddenException('无权操作');
    if (order.status !== 'IN_PROGRESS') throw new BadRequestException('订单状态不正确');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'REVIEWING' },
    });

    await this.notification.create({
      userId: order.buyerId,
      type: 'ORDER_STATUS',
      title: '订单已提交审核',
      content: `您的订单「${order.title}」创作者已提交作品，请审核`,
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  async requestRevision(orderId: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.buyerId !== buyerId) throw new ForbiddenException('无权操作');
    if (order.status !== 'REVIEWING') throw new BadRequestException('订单状态不正确');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'REVISION' },
    });

    await this.notification.create({
      userId: order.creatorId!,
      type: 'ORDER_STATUS',
      title: '买家要求修改',
      content: `订单「${order.title}」买家要求修改，请重新提交`,
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  async complete(orderId: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.buyerId !== buyerId) throw new ForbiddenException('无权操作');
    if (!['REVIEWING', 'REVISION'].includes(order.status)) {
      throw new BadRequestException('订单状态不正确');
    }

    // 释放托管资金
    await this.prisma.payment.updateMany({
      where: { orderId, status: 'PAID' },
      data: { status: 'RELEASED' },
    });

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
    });

    await this.notification.create({
      userId: order.creatorId!,
      type: 'ORDER_STATUS',
      title: '订单已完成',
      content: `订单「${order.title}」已通过验收，资金已释放`,
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  async cancel(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.buyerId !== userId && order.creatorId !== userId) {
      throw new ForbiddenException('无权操作');
    }
    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('订单无法取消');
    }

    // 退款
    await this.prisma.payment.updateMany({
      where: { orderId, status: 'PAID' },
      data: { status: 'REFUNDED' },
    });

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
  }
}
