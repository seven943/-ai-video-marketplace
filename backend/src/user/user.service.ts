import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });
    if (!user) throw new NotFoundException('用户不存在');

    const { password: _, ...result } = user as any;
    return result;
  }

  async updateProfile(userId: string, data: { nickname?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getCreatorList(params: {
    tags?: string;
    aiTools?: string;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    status?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { tags, aiTools, priceMin, priceMax, rating, status, keyword, page = 1, pageSize = 20 } = params;
    const where: any = {
      user: { role: { in: ['CREATOR', 'BOTH'] } },
    };
    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }
    if (aiTools) {
      where.aiTools = { hasSome: aiTools.split(',') };
    }
    if (priceMin !== undefined) {
      where.priceMax = { gte: priceMin };
    }
    if (priceMax !== undefined) {
      where.priceMin = { lte: priceMax };
    }
    if (rating !== undefined) {
      where.rating = { gte: rating };
    }
    if (status) {
      where.status = status.toUpperCase();
    }
    if (keyword) {
      where.OR = [
        { bio: { contains: keyword, mode: 'insensitive' } },
        { tags: { has: keyword } },
        { user: { nickname: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.creatorProfile.findMany({
        where,
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
        orderBy: { rating: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.creatorProfile.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getCreatorDetail(creatorId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId: creatorId },
      include: {
        user: { select: { id: true, nickname: true, avatar: true, createdAt: true } },
      },
    });
    if (!creator) throw new NotFoundException('创作者不存在');

    const works = await this.prisma.work.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    // 聚合统计数据
    const stats = await this.prisma.work.aggregate({
      where: { creatorId },
      _sum: { viewCount: true, likeCount: true },
      _count: true,
    });

    // 完成的订单数
    const completedOrders = await this.prisma.order.count({
      where: { creatorId, status: 'COMPLETED' },
    });

    return {
      ...creator,
      works,
      stats: {
        totalViews: stats._sum.viewCount || 0,
        totalLikes: stats._sum.likeCount || 0,
        totalWorks: stats._count,
        completedOrders,
      },
    };
  }

  async registerCreator(userId: string, data: {
    bio?: string;
    tags?: string[];
    aiTools?: string[];
    priceMin?: number;
    priceMax?: number;
  }) {
    // 更新用户角色
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'CREATOR' },
    });

    // 创建或更新创作者资料
    return this.prisma.creatorProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async updateCreatorProfile(userId: string, data: {
    bio?: string;
    tags?: string[];
    aiTools?: string[];
    priceMin?: number;
    priceMax?: number;
    portfolioUrls?: string[];
    status?: string;
  }) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('创作者资料不存在，请先注册成为创作者');

    const updateData: any = { ...data };
    if (data.status) {
      updateData.status = data.status.toUpperCase();
    }

    return this.prisma.creatorProfile.update({
      where: { userId },
      data: updateData,
    });
  }

  async getCreatorDashboard(creatorId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 并行查询所有统计数据
    const [
      totalIncome,
      monthlyIncome,
      escrowPayment,
      orderStats,
      worksStats,
      reviewStats,
      monthlyRevenueRaw,
      orderStatusDist,
    ] = await Promise.all([
      // 总收入（已释放）
      this.prisma.payment.aggregate({
        where: { order: { creatorId }, status: 'RELEASED' },
        _sum: { amount: true },
      }),
      // 本月收入
      this.prisma.payment.aggregate({
        where: { order: { creatorId }, status: 'RELEASED', updatedAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      // 托管中金额
      this.prisma.payment.aggregate({
        where: { order: { creatorId }, status: 'PAID' },
        _sum: { amount: true },
      }),
      // 订单统计
      this.prisma.order.groupBy({
        by: ['status'],
        where: { creatorId },
        _count: true,
      }),
      // 作品统计
      this.prisma.work.aggregate({
        where: { creatorId },
        _sum: { viewCount: true, likeCount: true },
        _count: true,
      }),
      // 评分统计
      this.prisma.review.aggregate({
        where: { targetId: creatorId },
        _avg: { rating: true },
        _count: true,
      }),
      // 近6个月收入趋势
      this.prisma.payment.findMany({
        where: {
          order: { creatorId },
          status: 'RELEASED',
          updatedAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
        select: { amount: true, updatedAt: true },
      }),
      // 订单状态分布
      this.prisma.order.groupBy({
        by: ['status'],
        where: { creatorId },
        _count: true,
      }),
    ]);

    // 处理订单统计
    const orderMap = Object.fromEntries(orderStats.map((s) => [s.status, s._count]));
    const totalOrders = Object.values(orderMap).reduce((a, b) => a + b, 0);

    // 处理月收入趋势（近6个月）
    const monthlyMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, 0);
    }
    monthlyRevenueRaw.forEach((p) => {
      const d = new Date(p.updatedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + p.amount);
      }
    });

    return {
      income: {
        total: totalIncome._sum.amount || 0,
        thisMonth: monthlyIncome._sum.amount || 0,
        escrow: escrowPayment._sum.amount || 0,
      },
      orders: {
        total: totalOrders,
        completed: orderMap['COMPLETED'] || 0,
        inProgress: (orderMap['IN_PROGRESS'] || 0) + (orderMap['REVIEWING'] || 0),
        cancelled: orderMap['CANCELLED'] || 0,
      },
      works: {
        totalViews: worksStats._sum.viewCount || 0,
        totalLikes: worksStats._sum.likeCount || 0,
        count: worksStats._count,
      },
      rating: {
        average: reviewStats._avg.rating || 0,
        count: reviewStats._count,
      },
      monthlyRevenue: Array.from(monthlyMap.entries()).map(([month, amount]) => ({ month, amount })),
      orderStatusDist: orderStatusDist.map((s) => ({ status: s.status, count: s._count })),
    };
  }
}
