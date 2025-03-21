import { Response } from 'express';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EnvironmentService } from '@root/environment/environment.service';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { JwtManagerService } from '@root/modules/jwt-manager/jwt-manager.service';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger: Logger = new Logger(RedisService.name);
  private readonly blackListClient: Redis;
  private readonly cartClient: Redis;

  constructor(private readonly environmentService: EnvironmentService) {
    this.blackListClient = new Redis({
      host: this.environmentService.redisHost,
      port: this.environmentService.redisPort,
      db: this.environmentService.redisDbJwtBlacklist,
      password: this.environmentService.redisPassword,
    });

    this.cartClient = new Redis({
      host: this.environmentService.redisHost,
      port: this.environmentService.redisPort,
      db: this.environmentService.redisDbCart,
      password: this.environmentService.redisPassword,
    });
  }

  async onModuleInit() {
    try {
      const blackListClientResult = await this.blackListClient.ping();
      const cartClientResult = await this.cartClient.ping();
      if (blackListClientResult !== 'PONG' || cartClientResult !== 'PONG') {
        return false;
      }
      this.logger.log('Redis databases connected');
    } catch (error: any) {
      this.logger.error(`Cannot connect to Redis server: ${error.message}`);
      return false;
    }
  }

  buildBlackListTokenValue(
    sub: string,
    jit: string = '*',
    iat: number | string = '*',
  ) {
    return `BlackListedToken_${sub}_${jit}_${iat}`;
  }

  async invalidateTokenToBlackList(
    { sub, jit, iat, exp }: TokenPayloadDto,
    value: string,
  ) {
    if (!exp) return false;

    // * Add 10 seconds to the token's expiration time to make sure it is blacklisted
    const expiresIn: number = exp - Math.floor(Date.now() / 1000) + 10;
    const key: string = this.buildBlackListTokenValue(sub, jit, iat);
    const response = await this.blackListClient.setex(key, expiresIn, value);
    return response === 'OK';
  }

  async validateBlackListedToken({
    sub,
    jit,
    iat,
  }: TokenPayloadDto): Promise<boolean> {
    if (!sub || !jit || !iat) return false;

    const value: string = this.buildBlackListTokenValue(sub, jit, iat);
    const result = await this.blackListClient.get(value);
    return result !== null;
  }

  async validateWithChangePasswordBlackListedToken({
    sub,
    jit,
    iat,
  }: TokenPayloadDto): Promise<boolean> {
    const pattern = this.buildBlackListTokenValue(sub, jit, '*');
    let cursor = '0';
    let latestIat = 0;

    do {
      const result = await this.blackListClient.scan(cursor, 'MATCH', pattern);
      cursor = result[0];

      for (const key of result[1]) {
        const keyIat = parseInt(key.split('_')[3]);
        if (!isNaN(keyIat) && keyIat > latestIat) {
          latestIat = keyIat;
        }
      }
    } while (cursor !== '0');

    return latestIat > iat;
  }
}
