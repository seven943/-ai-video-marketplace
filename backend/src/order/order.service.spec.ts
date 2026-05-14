import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ChatService } from '../chat/chat.service';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      order: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      payment: { updateMany: jest.fn() },
      creatorProfile: { findMany: jest.fn() },
      work: { groupBy: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: { create: jest.fn() } },
        { provide: ChatService, useValue: { createConversation: jest.fn() } },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('detail', () => {
    it('throws NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.detail('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('returns order when found', async () => {
      const mockOrder = { id: 'order-1', title: 'Test' };
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      expect(await service.detail('order-1')).toEqual(mockOrder);
    });
  });

  describe('accept', () => {
    it('throws NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.accept('nonexistent', 'creator-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when order is not PENDING', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'MATCHED', buyerId: 'buyer-1' });
      await expect(service.accept('order-1', 'creator-1')).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException when creator tries to accept own order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'PENDING', buyerId: 'creator-1' });
      await expect(service.accept('order-1', 'creator-1')).rejects.toThrow(ForbiddenException);
    });

    it('successfully accepts order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'PENDING', buyerId: 'buyer-1', title: 'Test' });
      prisma.order.update.mockResolvedValue({ id: 'order-1', status: 'MATCHED' });
      const result = await service.accept('order-1', 'creator-1');
      expect(result.status).toBe('MATCHED');
    });
  });

  describe('submitQuote', () => {
    it('throws when creator is not assigned', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', creatorId: 'other-creator' });
      await expect(service.submitQuote('order-1', 'creator-1', 100, '2026-06-01')).rejects.toThrow(ForbiddenException);
    });

    it('throws when order status is not MATCHED', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', creatorId: 'creator-1', status: 'PENDING' });
      await expect(service.submitQuote('order-1', 'creator-1', 100, '2026-06-01')).rejects.toThrow(BadRequestException);
    });

    it('throws when quoted price is negative', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', creatorId: 'creator-1', status: 'MATCHED', buyerId: 'buyer-1', title: 'Test' });
      await expect(service.submitQuote('order-1', 'creator-1', -100, '2026-06-01')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('throws when user is not buyer or creator', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', buyerId: 'buyer-1', creatorId: 'creator-1', status: 'IN_PROGRESS' });
      await expect(service.cancel('order-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('throws when order is completed', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', buyerId: 'buyer-1', status: 'COMPLETED' });
      await expect(service.cancel('order-1', 'buyer-1')).rejects.toThrow(BadRequestException);
    });

    it('successfully cancels order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', buyerId: 'buyer-1', status: 'PENDING' });
      prisma.payment.updateMany.mockResolvedValue({});
      prisma.order.update.mockResolvedValue({ id: 'order-1', status: 'CANCELLED' });
      const result = await service.cancel('order-1', 'buyer-1');
      expect(result.status).toBe('CANCELLED');
    });
  });
});
