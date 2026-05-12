import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function mockContext(user: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  it('should allow access when no roles required', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);
    expect(guard.canActivate(mockContext({ role: 'BUYER' }))).toBe(true);
  });

  it('should allow ADMIN to access any role-protected route', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['CREATOR']);
    expect(guard.canActivate(mockContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('should allow BOTH to access BUYER routes', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['BUYER']);
    expect(guard.canActivate(mockContext({ role: 'BOTH' }))).toBe(true);
  });

  it('should allow BOTH to access CREATOR routes', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['CREATOR']);
    expect(guard.canActivate(mockContext({ role: 'BOTH' }))).toBe(true);
  });

  it('should allow matching role', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['BUYER']);
    expect(guard.canActivate(mockContext({ role: 'BUYER' }))).toBe(true);
  });

  it('should reject non-matching role', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['CREATOR']);
    expect(() => guard.canActivate(mockContext({ role: 'BUYER' }))).toThrow(ForbiddenException);
  });

  it('should reject when no user present', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['BUYER']);
    expect(() => guard.canActivate(mockContext(null))).toThrow(ForbiddenException);
  });
});
