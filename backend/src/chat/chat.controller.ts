import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('聊天')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的会话列表' })
  async getConversations(@CurrentUser('id') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '会话消息列表' })
  async getMessages(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
  ) {
    return this.chatService.getMessages(conversationId, userId, page ? parseInt(page) : 1);
  }

  @Post('conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '发送消息（REST 方式）' })
  async sendMessage(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { content: string; type?: string },
  ) {
    return this.chatService.sendMessage(conversationId, userId, body.content, body.type);
  }

  @Get('unread-count')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '未读消息数' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.chatService.getUnreadCount(userId);
    return { count };
  }

  @Post('conversations/direct')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '直接联系创作者' })
  async getOrCreateDirect(
    @CurrentUser('id') userId: string,
    @Body() body: { creatorId: string },
  ) {
    return this.chatService.getOrCreateDirect(userId, body.creatorId);
  }

  // 管理员接口
  @Get('admin/conversations')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员 - 所有会话' })
  async adminGetConversations(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.chatService.adminGetConversations(
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Get('admin/messages')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员 - 所有消息' })
  async adminGetAllMessages(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.chatService.adminGetAllMessages(
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 50,
    );
  }

  @Get('admin/blocked')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员 - 被拦截消息' })
  async adminGetBlockedMessages(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.chatService.adminGetBlockedMessages(
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 50,
    );
  }
}
