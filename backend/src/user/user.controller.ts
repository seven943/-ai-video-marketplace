import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('用户')
@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('user/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Patch('user/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户信息' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { nickname?: string; avatar?: string },
  ) {
    return this.userService.updateProfile(userId, body);
  }

  @Get('creators')
  @ApiOperation({ summary: '获取创作者列表' })
  async getCreatorList(
    @Query('tags') tags?: string,
    @Query('aiTools') aiTools?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('rating') rating?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.userService.getCreatorList({
      tags,
      aiTools,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      status,
      keyword,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Get('creators/:id')
  @ApiOperation({ summary: '获取创作者详情' })
  async getCreatorDetail(@Param('id') id: string) {
    return this.userService.getCreatorDetail(id);
  }

  @Post('creators/register')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '注册成为创作者' })
  async registerCreator(
    @CurrentUser('id') userId: string,
    @Body() body: { bio?: string; tags?: string[]; aiTools?: string[]; priceMin?: number; priceMax?: number },
  ) {
    return this.userService.registerCreator(userId, body);
  }

  @Patch('creators/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新创作者资料' })
  async updateCreatorProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { bio?: string; tags?: string[]; aiTools?: string[]; priceMin?: number; priceMax?: number; portfolioUrls?: string[]; status?: string },
  ) {
    return this.userService.updateCreatorProfile(userId, body);
  }

  @Get('dashboard/creator')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创作者数据看板' })
  async getCreatorDashboard(@CurrentUser('id') userId: string) {
    return this.userService.getCreatorDashboard(userId);
  }
}
