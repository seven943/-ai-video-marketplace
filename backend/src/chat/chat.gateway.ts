import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      client.data.userId = userId;
      this.onlineUsers.set(userId, client.id);
      client.emit('connected', { userId });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.onlineUsers.delete(userId);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conv:${data.conversationId}`);
    await this.chatService.markAsRead(data.conversationId, client.data.userId);
    client.emit('joined', { conversationId: data.conversationId });
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conv:${data.conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; type?: string },
  ) {
    const userId = client.data.userId;
    const result = await this.chatService.sendMessage(
      data.conversationId,
      userId,
      data.content,
      data.type || 'TEXT',
    );

    if (result.blocked) {
      // 通知发送者消息被拦截
      client.emit('message_blocked', {
        message: result.message,
        reason: result.reason,
      });
      // 通知管理员
      this.server.to('admin_room').emit('admin_alert', {
        type: 'message_blocked',
        message: result.message,
        reason: result.reason,
      });
    } else {
      // 广播给会话房间（不包括发送者）
      client.to(`conv:${data.conversationId}`).emit('receive_message', {
        message: result.message,
      });
    }

    return result;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.to(`conv:${data.conversationId}`).emit('user_typing', {
      userId: client.data.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await this.chatService.markAsRead(data.conversationId, client.data.userId);
  }

  @SubscribeMessage('join_admin')
  handleJoinAdmin(@ConnectedSocket() client: Socket) {
    client.join('admin_room');
  }
}
