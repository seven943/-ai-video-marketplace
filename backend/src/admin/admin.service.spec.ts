import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    user: { count: jest.Mock; findMany: jest.Mock; update: jest.Mock };
    order: { count: jest.Mock; findMany: jest.Mock };
    work: { count: jest.Mock };
    payment: { aggregate: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { count: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      order: { count: jest.fn(), findMany: jest.fn() },
      work: { count: jest.fn() },
      payment: { aggregate: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getStats', () => {
    it('should return aggregated stats', async () => {
      prisma.user.count.mockResolvedValueOnce(100); // totalUsers
      prisma.user.count.mockResolvedValueOnce(30);  // totalCreators
      prisma.order.count.mockResolvedValueOnce(50); // totalOrders
      prisma.order.count.mockResolvedValueOnce(20); // completedOrders
      prisma.work.count.mockResolvedValueOnce(200); // totalWorks
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 50000 } });
      prisma.user.findMany.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);

      const result = await service.getStats();

      expect(result.totalUsers).toBe(100);
      expect(result.totalCreators).toBe(30);
      expect(result.totalOrders).toBe(50);
      expect(result.completedOrders).toBe(20);
      expect(result.totalWorks).toBe(200);
      expect(result.totalRevenue).toBe(50000);
    });

    it('should handle zero revenue', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.order.count.mockResolvedValue(0);
      prisma.work.count.mockResolvedValue(0);
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });
      prisma.user.findMany.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);

      const result = await service.getStats();
      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [{ id: '1', nickname: 'test', phone: '138', role: 'BUYER', createdAt: new Date(), creatorProfile: null }];
      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.getUsers({ page: 1, pageSize: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by role', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.getUsers({ role: 'ADMIN' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'ADMIN' } }),
      );
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      prisma.user.update.mockResolvedValue({ id: '1', role: 'ADMIN' });

      const result = await service.updateUserRole('1', 'ADMIN');

      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { role: 'ADMIN' } });
      expect(result.role).toBe('ADMIN');
    });
  });
});
