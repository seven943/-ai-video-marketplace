import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WorksModule } from './works/works.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewModule } from './review/review.module';
import { UploadModule } from './upload/upload.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    WorksModule,
    OrderModule,
    PaymentModule,
    ReviewModule,
    UploadModule,
    NotificationModule,
  ],
})
export class AppModule {}
