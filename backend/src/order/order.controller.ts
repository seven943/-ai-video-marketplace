import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('订单')
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '订单列表' })
  async list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.orderService.list({
      status,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '订单详情' })
  async detail(@Param('id') id: string) {
    return this.orderService.detail(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布需求' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.orderService.create(userId, body);
  }

  @Post(':id/accept')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '接单' })
  async accept(
    @Param('id') id: string,
    @CurrentUser('id') creatorId: string,
  ) {
    return this.orderService.accept(id, creatorId);
  }

  @Post(':id/submit-quote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创作者报价' })
  async submitQuote(
    @Param('id') id: string,
    @CurrentUser('id') creatorId: string,
    @Body() body: { quotedPrice: number; quotedDeadline: string },
  ) {
    return this.orderService.submitQuote(id, creatorId, body.quotedPrice, body.quotedDeadline);
  }

  @Post(':id/accept-quote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '买家接受报价' })
  async acceptQuote(
    @Param('id') id: string,
    @CurrentUser('id') buyerId: string,
  ) {
    return this.orderService.acceptQuote(id, buyerId);
  }

  @Post(':id/reject-quote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '买家拒绝报价' })
  async rejectQuote(
    @Param('id') id: string,
    @CurrentUser('id') buyerId: string,
  ) {
    return this.orderService.rejectQuote(id, buyerId);
  }

  @Post(':id/deliver')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '交付' })
  async deliver(
    @Param('id') id: string,
    @CurrentUser('id') creatorId: string,
  ) {
    return this.orderService.deliver(id, creatorId);
  }

  @Post(':id/complete')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '验收完成' })
  async complete(
    @Param('id') id: string,
    @CurrentUser('id') buyerId: string,
  ) {
    return this.orderService.complete(id, buyerId);
  }

  @Post(':id/start')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '开始制作' })
  async startWork(
    @Param('id') id: string,
    @CurrentUser('id') creatorId: string,
  ) {
    return this.orderService.startWork(id, creatorId);
  }

  @Post(':id/request-revision')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '要求修改' })
  async requestRevision(
    @Param('id') id: string,
    @CurrentUser('id') buyerId: string,
  ) {
    return this.orderService.requestRevision(id, buyerId);
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消订单' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orderService.cancel(id, userId);
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: '获取推荐创作者' })
  async getRecommendations(@Param('id') id: string) {
    return this.orderService.getRecommendations(id);
  }
}
