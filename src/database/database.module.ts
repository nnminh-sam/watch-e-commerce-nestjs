import { Module } from '@nestjs/common';
import { AppConfigModule } from '@root/app-config/app-config.module';
import { MongooseModuleProvider } from '@root/database/provider/mongodb.provider';
import { RedisProvider } from '@root/database/provider/redis.provider';
import { RedisService } from '@root/database/redis.service';

@Module({
  imports: [AppConfigModule, MongooseModuleProvider],
  providers: [RedisProvider, RedisService],
  exports: [RedisService],
})
export class DatabaseModule {}
