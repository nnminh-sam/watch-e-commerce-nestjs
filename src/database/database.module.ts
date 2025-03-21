import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisProvider } from '@root/database/provider/redis.provider';
import { RedisService } from '@root/database/redis.service';
import { EnvironmentModule } from '@root/environment/environment.module';
import { EnvironmentService } from '@root/environment/environment.service';
import { JwtManagerModule } from '@root/modules/jwt-manager/jwt-manager.module';

@Module({
  imports: [
    EnvironmentModule,
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: (environmentService: EnvironmentService) => {
        const host = environmentService.databaseHost;
        const port = environmentService.databasePort;
        const dbName = environmentService.databaseName;
        const username = environmentService.databaseUsername;
        const password = environmentService.databasePassword;

        const credentials =
          username && password ? `${username}:${password}@` : '';
        const uri = `mongodb://${credentials}${host}:${port}/${dbName}?authSource=admin`;

        return {
          uri,
          authSource: 'admin',
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class DatabaseModule {}
