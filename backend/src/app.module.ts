import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WorksModule } from './works/works.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewModule } from './review/review.module';
import { UploadModule } from './upload/upload.module';
import { NotificationModule } from './notification/notification.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    PrismaModule,
    AuthModule,
    UserModule,
    WorksModule,
    OrderModule,
    PaymentModule,
    ReviewModule,
    UploadModule,
    NotificationModule,
    ChatModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
