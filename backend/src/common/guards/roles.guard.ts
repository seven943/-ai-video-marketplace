import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 没有 @Roles() 装饰器的接口直接放行
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('未登录');
    }

    // ADMIN 角色自动通过所有检查
    if (user.role === 'ADMIN') {
      return true;
    }

    // BOTH 角色自动通过 BUYER 和 CREATOR 的检查
    if (user.role === 'BOTH') {
      const hasAccess = requiredRoles.some(
        (role) => role === 'BUYER' || role === 'CREATOR' || role === 'BOTH',
      );
      if (hasAccess) return true;
    }

    // 检查用户角色是否在允许列表中
    if (requiredRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('无权执行此操作');
  }
}
