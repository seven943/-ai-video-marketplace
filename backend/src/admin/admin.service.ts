import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalCreators, totalOrders, completedOrders, totalWorks, totalRevenue] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: { in: ['CREATOR', 'BOTH'] } } }),
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'COMPLETED' } }),
        this.prisma.work.count(),
        this.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      ]);

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, nickname: true, phone: true, role: true, createdAt: true },
    });

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, budgetMin: true, budgetMax: true, createdAt: true },
    });

    return {
      totalUsers,
      totalCreators,
      totalOrders,
      completedOrders,
      totalWorks,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentUsers,
      recentOrders,
    };
  }

  async getUsers(params: { page?: number; pageSize?: number; role?: string; keyword?: string }) {
    const { page = 1, pageSize = 20, role, keyword } = params;
    const where: any = {};
    if (role) where.role = role;
    if (keyword) {
      where.OR = [
        { nickname: { contains: keyword, mode: 'insensitive' } },
        { phone: { contains: keyword } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, nickname: true, phone: true, role: true, createdAt: true, creatorProfile: { select: { status: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { role: role as any } });
  }

  async getAllOrders(params: { page?: number; pageSize?: number; status?: string; keyword?: string }) {
    const { page = 1, pageSize = 20, status, keyword } = params;
    const where: any = {};
    if (status) where.status = status;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, nickname: true } },
          creator: { select: { id: true, nickname: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
