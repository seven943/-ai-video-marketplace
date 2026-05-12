import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue('test-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('sendCode', () => {
    it('should accept valid phone number', async () => {
      const result = await service.sendCode('13800000000');
      expect(result).toEqual({ message: '验证码已发送' });
    });

    it('should reject invalid phone number', async () => {
      await expect(service.sendCode('123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-1',
      phone: '13800000000',
      nickname: '测试用户',
      avatar: '',
      role: 'BUYER',
      creditScore: 100,
    };

    it('should reject wrong verification code', async () => {
      await expect(service.login('13800000000', '000000')).rejects.toThrow(UnauthorizedException);
    });

    it('should return existing user on login', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login('13800000000', '123456');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { phone: '13800000000' } });
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(result.user.id).toBe('user-1');
      expect(result.token).toBe('test-token');
    });

    it('should create new user if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.login('13800000000', '123456');

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.id).toBe('user-1');
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      const mockUser = { id: 'user-1', phone: '13800000000' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-1');
      expect(result.id).toBe('user-1');
    });

    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('nonexistent')).rejects.toThrow(UnauthorizedException);
    });
  });
});
