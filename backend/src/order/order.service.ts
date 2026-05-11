import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ChatService } from '../chat/chat.service';
import { OrderStatus, VideoCategory } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private chatService: ChatService,
  ) {}

  async list(params: { status?: string; category?: string; budgetMin?: number; budgetMax?: number; keyword?: string; sort?: string; page?: number; pageSize?: number }) {
    const { status, category, budgetMin, budgetMax, keyword, sort, page = 1, pageSize = 20 } = params;
    const where: any = {};
    if (status) where.status = status as OrderStatus;
    if (category) where.category = category as VideoCategory;
    if (budgetMin || budgetMax) {
      where.AND = where.AND || [];
      if (budgetMin) {
        where.AND.push({ budgetMax: { gte: budgetMin } });
      }
      if (budgetMax) {
        where.AND.push({ budgetMin: { lte: budgetMax } });
      }
    }
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'budget_asc') orderBy = { budgetMin: 'asc' };
    else if (sort === 'budget_desc') orderBy = { budgetMax: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          buyer: { select: { id: true, nickname: true, avatar: true } },
          creator: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy,
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

    // 自动创建聊天会话
    await this.chatService.createConversation(orderId, order.buyerId, creatorId);

    await this.notification.create({
      userId: order.buyerId,
      type: 'ORDER_STATUS',
      title: '订单已被接单',
      content: `您的订单「${order.title}」已被创作者接单，请等待创作者报价`,
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  async submitQuote(orderId: string, creatorId: string, quotedPrice: number, quotedDeadline: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.creatorId !== creatorId) throw new ForbiddenException('无权操作');
    if (order.status !== 'MATCHED') throw new BadRequestException('订单状态不正确，需要在已匹配状态下报价');
    if (quotedPrice <= 0) throw new BadRequestException('报价金额必须大于0');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        quotedPrice,
        quotedDeadline: new Date(quotedDeadline),
        status: 'QUOTING',
      },
    });

    await this.notification.create({
      userId: order.buyerId,
      type: 'ORDER_STATUS',
      title: '创作者已报价',
      content: `订单「${order.title}」创作者报价 ¥${quotedPrice}，请查看并确认`,
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  async acceptQuote(orderId: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.buyerId !== buyerId) throw new ForbiddenException('无权操作');
    if (order.status !== 'QUOTING') throw new BadRequestException('订单状态不正确');
    if (!order.quotedPrice) throw new BadRequestException('报价信息不完整');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'QUOTE_ACCEPTED' },
    });

    await this.notification.create({
      userId: order.creatorId!,
      type: 'ORDER_STATUS',
      title: '买家已接受报价',
      content: `订单「${order.title}」买家已接受报价 ¥${order.quotedPrice}，等待买家支付定金`,
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  async rejectQuote(orderId: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.buyerId !== buyerId) throw new ForbiddenException('无权操作');
    if (order.status !== 'QUOTING') throw new BadRequestException('订单状态不正确');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        quotedPrice: null,
        quotedDeadline: null,
        status: 'MATCHED',
      },
    });

    await this.notification.create({
      userId: order.creatorId!,
      type: 'ORDER_STATUS',
      title: '买家拒绝了报价',
      content: `订单「${order.title}」买家拒绝了您的报价，请重新报价`,
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  async startWork(orderId: string, creatorId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.creatorId !== creatorId) throw new ForbiddenException('无权操作');
    if (!['MATCHED', 'QUOTE_ACCEPTED'].includes(order.status)) {
      throw new BadRequestException('订单状态不正确');
    }

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

  async getRecommendations(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');

    // 获取所有在线/忙碌的创作者
    const creators = await this.prisma.creatorProfile.findMany({
      where: {
        user: { role: { in: ['CREATOR', 'BOTH'] } },
        status: { in: ['ONLINE', 'BUSY'] },
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });

    // 提取订单关键词（从标题和描述中）
    const orderText = `${order.title} ${order.description}`.toLowerCase();
    const orderKeywords = orderText
      .replace(/[^一-龥a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    // 查询每个创作者的作品分类统计
    const creatorIds = creators.map((c) => c.userId);
    const worksByCreator = await this.prisma.work.groupBy({
      by: ['creatorId', 'category'],
      where: { creatorId: { in: creatorIds } },
      _count: true,
    });

    // 构建分类匹配映射
    const categoryMap = new Map<string, number>();
    worksByCreator.forEach((w) => {
      const key = `${w.creatorId}:${w.category}`;
      categoryMap.set(key, w._count);
    });

    // 计算每个创作者的推荐分数
    const scored = creators.map((creator) => {
      let score = 0;

      // 1. 作品分类匹配（权重 30）
      const categoryCount = categoryMap.get(`${creator.userId}:${order.category}`) || 0;
      if (categoryCount > 0) score += 30 + Math.min(categoryCount * 2, 10);

      // 2. 价格范围匹配（权重 25）
      const priceOverlap =
        creator.priceMin <= order.budgetMax && creator.priceMax >= order.budgetMin;
      if (priceOverlap) {
        score += 25;
        // 价格越接近预算中间值，分数越高
        const orderMid = (order.budgetMin + order.budgetMax) / 2;
        const creatorMid = (creator.priceMin + creator.priceMax) / 2;
        const priceDiff = Math.abs(orderMid - creatorMid) / orderMid;
        score += Math.max(0, 10 * (1 - priceDiff));
      }

      // 3. 标签匹配（权重 20）
      const tagOverlap = creator.tags.filter((tag) =>
        orderKeywords.some((kw) => tag.toLowerCase().includes(kw)) ||
        orderText.includes(tag.toLowerCase())
      ).length;
      score += Math.min(tagOverlap * 5, 20);

      // 4. 评分（权重 15）
      score += (creator.rating / 5) * 15;

      // 5. 完成订单数（权重 10）
      score += Math.min(creator.orderCount / 20, 1) * 10;

      // 6. 在线状态加分
      if (creator.status === 'ONLINE') score += 5;

      return {
        ...creator,
        matchScore: Math.round(score * 10) / 10,
        matchReasons: [
          categoryCount > 0 ? `有${categoryCount}个同类作品` : null,
          priceOverlap ? '价格匹配' : null,
          tagOverlap > 0 ? `匹配${tagOverlap}个标签` : null,
          creator.rating >= 4.5 ? '高评分' : null,
        ].filter(Boolean),
      };
    });

    // 按分数排序，返回前10个
    return scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }
}
