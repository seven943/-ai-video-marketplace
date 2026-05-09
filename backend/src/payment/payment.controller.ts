import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentMethod } from '@prisma/client';

@ApiTags('支付')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建支付' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string; method: PaymentMethod },
  ) {
    return this.paymentService.create(body.orderId, body.method, userId);
  }

  @Post(':orderId/release')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '释放资金（验收后）' })
  async release(@Param('orderId') orderId: string) {
    return this.paymentService.release(orderId);
  }

  @Post(':orderId/refund')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '退款' })
  async refund(@Param('orderId') orderId: string) {
    return this.paymentService.refund(orderId);
  }

  @Get(':id/status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询支付状态' })
  async getStatus(@Param('id') id: string) {
    return this.paymentService.getStatus(id);
  }
}
