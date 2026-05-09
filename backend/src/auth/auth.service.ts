import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // 发送验证码（MVP 阶段：固定验证码 123456，后续接入短信服务）
  async sendCode(phone: string) {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestException('手机号格式不正确');
    }
    // TODO: 接入阿里云短信服务
    console.log(`[SMS] Sending code to ${phone}: 123456`);
    return { message: '验证码已发送' };
  }

  // 登录/注册
  async login(phone: string, code: string) {
    // MVP 阶段：验证码固定为 123456
    if (code !== '123456') {
      throw new UnauthorizedException('验证码错误');
    }

    // 查找或创建用户
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,
        },
      });
    }

    const token = this.jwt.sign({ sub: user.id, phone: user.phone });

    return {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        creditScore: user.creditScore,
      },
      token,
    };
  }

  // 验证 token
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    return user;
  }
}
