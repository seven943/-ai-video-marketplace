import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendCodeDto, LoginDto } from './dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-code')
  @ApiOperation({ summary: '发送验证码' })
  async sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendCode(dto.phone);
  }

  @Post('login')
  @ApiOperation({ summary: '登录/注册' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.code);
  }
}
