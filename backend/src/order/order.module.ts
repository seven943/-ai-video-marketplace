import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationModule } from '../notification/notification.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [NotificationModule, ChatModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
