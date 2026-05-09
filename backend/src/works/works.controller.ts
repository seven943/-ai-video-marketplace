import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WorksService } from './works.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('作品')
@Controller('works')
export class WorksController {
  constructor(private worksService: WorksService) {}

  @Get()
  @ApiOperation({ summary: '作品列表' })
  async list(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.worksService.list({
      category,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '作品详情' })
  async detail(@Param('id') id: string) {
    return this.worksService.detail(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布作品' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: { title: string; coverUrl: string; videoUrl: string; category: string; tags?: string[] },
  ) {
    return this.worksService.create(userId, body as any);
  }

  @Post(':id/like')
  @ApiOperation({ summary: '点赞作品' })
  async like(@Param('id') id: string) {
    return this.worksService.like(id);
  }
}
