import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentFilterService } from './content-filter.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private contentFilter: ContentFilterService,
  ) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { creatorId: userId }],
      },
      include: {
        order: { select: { id: true, title: true, status: true } },
        buyer: { select: { id: true, nickname: true, avatar: true } },
        creator: { select: { id: true, nickname: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderId: true, blocked: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMessages(conversationId: string, userId: string, page = 1, pageSize = 50) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('会话不存在');
    if (conv.buyerId !== userId && conv.creatorId !== userId) {
      throw new ForbiddenException('无权访问此会话');
    }

    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId, blocked: false },
        include: { sender: { select: { id: true, nickname: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({ where: { conversationId, blocked: false } }),
    ]);

    return { items: items.reverse(), total, page, pageSize };
  }

  async sendMessage(conversationId: string, senderId: string, content: string, type = 'TEXT') {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('会话不存在');
    if (conv.buyerId !== senderId && conv.creatorId !== senderId) {
      throw new ForbiddenException('无权发送消息');
    }

    const filterResult = this.contentFilter.filter(content);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
        blocked: filterResult.blocked,
      },
      include: { sender: { select: { id: true, nickname: true, avatar: true } } },
    });

    // 更新会话时间
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      message,
      blocked: filterResult.blocked,
      reason: filterResult.reason,
    };
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { creatorId: userId }],
      },
      select: { id: true },
    });

    const convIds = conversations.map((c) => c.id);
    if (convIds.length === 0) return 0;

    return this.prisma.message.count({
      where: {
        conversationId: { in: convIds },
        senderId: { not: userId },
        read: false,
        blocked: false,
      },
    });
  }

  async createConversation(orderId: string, buyerId: string, creatorId: string) {
    const existing = await this.prisma.conversation.findUnique({
      where: { orderId },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { orderId, buyerId, creatorId },
    });
  }

  async getOrCreateDirect(buyerId: string, creatorId: string) {
    if (buyerId === creatorId) {
      throw new ForbiddenException('不能联系自己');
    }

    // 查找已有的会话
    const existing = await this.prisma.conversation.findFirst({
      where: {
        buyerId,
        creatorId,
      },
      include: {
        order: { select: { id: true, title: true, status: true } },
      },
    });
    if (existing) return existing;

    // 创建草稿订单
    const order = await this.prisma.order.create({
      data: {
        buyerId,
        title: '咨询需求',
        description: '买家通过创作者主页发起的咨询',
        category: 'OTHER',
        budgetMin: 0,
        budgetMax: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        status: 'PENDING',
      },
    });

    // 创建会话
    return this.prisma.conversation.create({
      data: {
        orderId: order.id,
        buyerId,
        creatorId,
      },
      include: {
        order: { select: { id: true, title: true, status: true } },
      },
    });
  }

  // 管理员接口
  async adminGetAllMessages(page = 1, pageSize = 50) {
    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        include: {
          sender: { select: { id: true, nickname: true, avatar: true, role: true } },
          conversation: {
            include: {
              order: { select: { id: true, title: true } },
              buyer: { select: { id: true, nickname: true } },
              creator: { select: { id: true, nickname: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count(),
    ]);

    return { items, total, page, pageSize };
  }

  async adminGetBlockedMessages(page = 1, pageSize = 50) {
    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { blocked: true },
        include: {
          sender: { select: { id: true, nickname: true, avatar: true, phone: true } },
          conversation: {
            include: {
              order: { select: { id: true, title: true } },
              buyer: { select: { id: true, nickname: true } },
              creator: { select: { id: true, nickname: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({ where: { blocked: true } }),
    ]);

    return { items, total, page, pageSize };
  }

  async adminGetConversations(page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.conversation.findMany({
        include: {
          order: { select: { id: true, title: true, status: true } },
          buyer: { select: { id: true, nickname: true } },
          creator: { select: { id: true, nickname: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.conversation.count(),
    ]);

    return { items, total, page, pageSize };
  }
}
