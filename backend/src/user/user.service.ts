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

    return { ...creator, works };
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
}
