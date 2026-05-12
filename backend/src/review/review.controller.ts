import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReviewService } from './review.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReviewDto } from './dto';

@ApiTags('评价')
@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('BUYER', 'BOTH')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建评价' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create({
      orderId: dto.orderId,
      reviewerId: userId,
      rating: dto.rating,
      content: dto.content,
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
