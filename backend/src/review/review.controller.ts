import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReviewService } from './review.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('评价')
@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建评价' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string; rating: number; content: string },
  ) {
    return this.reviewService.create({
      orderId: body.orderId,
      reviewerId: userId,
      rating: body.rating,
      content: body.content,
    });
  }

  @Get()
  @ApiOperation({ summary: '评价列表' })
  async list(
    @Query('targetId') targetId?: string,
    @Query('orderId') orderId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reviewService.list({
      targetId,
      orderId,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }
}
