import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisService } from '@root/database/redis.service';
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

        const useMongoCluster = environmentService.useMongoCluster;
        if (useMongoCluster) {
          logger.log('Using Mongo cluster with 3 nodes');
          logger.log(
            `Connection URI: ${environmentService.databaseClusterUrl}`,
          );
          logger.log(`Database name: ${environmentService.databaseName}`);
          logger.log(`Database 1 port: ${environmentService.database1Port}`);
          logger.log(`Database 2 port: ${environmentService.database2Port}`);
          logger.log(`Database 3 port: ${environmentService.database3Port}`);

          return {
            uri: environmentService.databaseClusterUrl,
            dbName: environmentService.databaseName,
          };
        }

        logger.log('Using single Mongo database');
        if (environmentService?.databaseUrl) {
          logger.log(`Connection URI: ${environmentService.databaseUrl}`);
          logger.log(`Database name: ${environmentService.databaseName}`);

          return {
            uri: environmentService.databaseUrl,
            dbName: environmentService.databaseName,
            authSource: 'admin',
          };
        }

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
        logger.log(`Database password: ${environmentService.databasePassword}`);

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
