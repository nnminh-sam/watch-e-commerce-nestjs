import { Module } from '@nestjs/common';
import { CartModule } from './modules/cart/cart.module';
import { AuthModule } from '@root/modules/auth/auth.module';
import { BrandModule } from '@root/modules/brand/brand.module';
import { CategoryModule } from '@root/modules/category/category.module';
import { DatabaseModule } from '@root/database/database.module';
import { ProductModule } from '@root/modules/product/product.module';
import { UserModule } from '@root/modules/user/user.module';
import { EnvironmentModule } from '@root/environment/environment.module';
import { JwtManagerModule } from './modules/jwt-manager/jwt-manager.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrderModule } from '@root/modules/order/order.module';
import { LoggerModule } from '@root/modules/logger/logger.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { MessageQueueModule } from './message-queue/message-queue.module';
import { BullModule } from '@nestjs/bullmq';
import { EnvironmentService } from '@root/environment/environment.service';

@Module({
  imports: [
    EnvironmentModule,
    UserModule,
    ProductModule,
    BrandModule,
    CategoryModule,
    AuthModule,
    DatabaseModule,
    CartModule,
    OrderModule,
    JwtManagerModule,
    LoggerModule,
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: (environmentService: EnvironmentService) => ({
        connection: {
          host: environmentService.redisHost,
          port: environmentService.redisPort,
          username: environmentService.redisUsername,
          password: environmentService.redisPassword,
          db: 0,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),
    CloudinaryModule,
    MessageQueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
