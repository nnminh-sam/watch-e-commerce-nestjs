import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private logger: Logger = new Logger(RedisService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  private async isRedisConnected() {
    try {
      const pingResult = await this.redisClient.ping();
      return pingResult === 'PONG';
    } catch (error: any) {
      this.logger.error(
        `Cannot connect to Redis for blacklisting tokens: ${error.message}`,
      );
      return false;
    }
  }

  async onModuleInit() {
    const isRedisConnected = await this.isRedisConnected();
    if (isRedisConnected) {
      this.logger.log('Connected to Redis for blacklisting tokens');
    }
  }

  async setTokenToBlackList(token: string, ttl: number) {
    return this.redisClient.set(token, 1, 'EX', ttl);
  }

  async isTokenBlacklisted(token: string) {
    const result = await this.redisClient.get(token);
    return result !== null;
  }
}
