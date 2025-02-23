import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './app-config/app-config.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    AppConfigModule,
    UserModule,
    ProductModule,
    BrandModule,
    CategoryModule,
    AuthModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
