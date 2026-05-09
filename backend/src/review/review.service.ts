import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    orderId: string;
    reviewerId: string;
    rating: number;
    content: string;
  }) {
    const { orderId, reviewerId, rating, content } = data;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('评分必须在 1-5 之间');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { reviews: true },
    });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 'COMPLETED') throw new BadRequestException('订单未完成，不能评价');
    if (order.buyerId !== reviewerId) throw new ForbiddenException('只有买家可以评价');

    const existing = order.reviews.find((r) => r.reviewerId === reviewerId);
    if (existing) throw new BadRequestException('已经评价过了');

    const review = await this.prisma.review.create({
      data: {
        orderId,
        reviewerId,
        targetId: order.creatorId!,
        rating,
        content,
      },
    });

    // 更新创作者平均评分
    const allReviews = await this.prisma.review.findMany({
      where: { targetId: order.creatorId! },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await this.prisma.creatorProfile.update({
      where: { userId: order.creatorId! },
      data: { rating: Math.round(avgRating * 10) / 10 },
    });

    return review;
  }

  async list(params: { targetId?: string; orderId?: string; page?: number; pageSize?: number }) {
    const { targetId, orderId, page = 1, pageSize = 20 } = params;
    const where: any = {};
    if (targetId) where.targetId = targetId;
    if (orderId) where.orderId = orderId;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          reviewer: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
