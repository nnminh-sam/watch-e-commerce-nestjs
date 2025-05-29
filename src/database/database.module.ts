import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisCartService } from '@root/database/redis-cart.service';
import { TokenBlackListService } from '@root/database/token-black-list.service';
import { EnvironmentModule } from '@root/environment/environment.module';
import { EnvironmentService } from '@root/environment/environment.service';
import mongoose from 'mongoose';

@Module({
  imports: [
    EnvironmentModule,
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: (environmentService: EnvironmentService) => {
        const logger: Logger = new Logger(
          `${DatabaseModule.name}.FactoryFunction`,
        );

        logger.log(`MongoDB Debug: ${environmentService.databaseDebug}`);
        mongoose.set('debug', environmentService.databaseDebug);

        if (environmentService?.databaseUrl) {
          logger.log('Connected to database using provided URL');
          return {
            uri: environmentService.databaseUrl,
            authSource: 'admin',
          };
        }

        logger.log('Connected to database using provided properties');
        const host = environmentService.databaseHost;
        const port = environmentService.databasePort;
        const dbName = environmentService.databaseName;
        const username = environmentService.databaseUsername;
        const password = environmentService.databasePassword;
        const credentials =
          username && password ? `${username}:${password}@` : '';
        const uri = `mongodb://${credentials}${host}:${port}/${dbName}?authSource=admin`;
        logger.log(`Database host: ${environmentService.databaseHost}`);
        logger.log(`Database port: ${environmentService.databasePort}`);
        logger.log(`Database name: ${environmentService.databaseName}`);
        logger.log(`Database username: ${environmentService.databaseUsername}`);

        return {
          uri,
          authSource: 'admin',
        };
      },
    }),
  ],
  providers: [TokenBlackListService],
  exports: [TokenBlackListService],
})
export class DatabaseModule {}
