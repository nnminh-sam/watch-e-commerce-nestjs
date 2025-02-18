import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './app-config/app-config.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '@root/app-config/app-config.service';
import { ProductModule } from './product/product.module';
import { BrandModule } from './brand/brand.module';

@Module({
  imports: [
    AppConfigModule,
    UserModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (appConfigService: AppConfigService) => ({
        uri: appConfigService.databaseUrl,
      }),
    }),
    ProductModule,
    BrandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
