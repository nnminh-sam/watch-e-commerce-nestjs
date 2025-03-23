import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get jwtSecret() {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn() {
    return this.configService.get<string>('JWT_EXPIRES_IN');
  }

  get refreshTokenExpiresIn() {
    return this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN');
  }

  get databaseUrl() {
    return this.configService.get<string>('DATABASE_URL');
  }

  get databaseHost() {
    return this.configService.get<string>('DATABASE_HOST');
  }

  get databasePort() {
    return this.configService.get<number>('DATABASE_PORT');
  }

  get databaseName() {
    return this.configService.get<string>('DATABASE_NAME');
  }

  get databaseUsername() {
    return this.configService.get<string>('DATABASE_USERNAME');
  }

  get databasePassword() {
    return this.configService.get<string>('DATABASE_PASSWORD');
  }

  get databaseDebug() {
    return this.configService.get<boolean>('DATABASE_DEBUG');
  }

  get redisHost() {
    return this.configService.get<string>('REDIS_HOST');
  }

  get redisPort() {
    return this.configService.get<number>('REDIS_PORT');
  }

  get redisPassword() {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  get redisDbJwtBlacklist() {
    return this.configService.get<number>('REDIS_DB_JWT_BLACKLIST');
  }

  get redisDbCart() {
    return this.configService.get<number>('REDIS_DB_CART');
  }

  get redisDbRpc() {
    return this.configService.get<number>('REDIS_DB_RPC');
  }

  get useMongoCluster() {
    return this.configService.get<boolean>('USE_MONGO_CLUSTER');
  }

  get databaseClusterUrl() {
    return this.configService.get<string>('DATABASE_CLUSTER_URL');
  }

  get database1Port() {
    return this.configService.get<number>('DATABASE_1_PORT');
  }

  get database2Port() {
    return this.configService.get<number>('DATABASE_2_PORT');
  }

  get database3Port() {
    return this.configService.get<number>('DATABASE_3_PORT');
  }
}
