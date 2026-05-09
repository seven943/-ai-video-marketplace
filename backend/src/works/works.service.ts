import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VideoCategory } from '@prisma/client';

@Injectable()
export class WorksService {
  constructor(private prisma: PrismaService) {}

  async list(params: { category?: string; page?: number; pageSize?: number }) {
    const { category, page = 1, pageSize = 20 } = params;
    const where: any = {};
    if (category) where.category = category as VideoCategory;

    const [items, total] = await Promise.all([
      this.prisma.work.findMany({
        where,
        include: {
          creator: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.work.count({ where }),
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
    const work = await this.prisma.work.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    if (!work) throw new NotFoundException('作品不存在');

    // 增加浏览量
    await this.prisma.work.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return work;
  }

  async create(userId: string, data: {
    title: string;
    coverUrl: string;
    videoUrl: string;
    category: VideoCategory;
    tags?: string[];
  }) {
    return this.prisma.work.create({
      data: { creatorId: userId, ...data },
    });
  }

  async like(id: string) {
    const work = await this.prisma.work.findUnique({ where: { id } });
    if (!work) throw new NotFoundException('作品不存在');

    return this.prisma.work.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
    });
  }
}
