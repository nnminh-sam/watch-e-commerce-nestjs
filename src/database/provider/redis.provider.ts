import { Provider } from '@nestjs/common';
import { AppConfigService } from '@root/app-config/app-config.service';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  inject: [AppConfigService],
  useFactory: (appConfigService: AppConfigService) => {
    return new Redis({
      host: appConfigService.redisBlacklistHost,
      port: appConfigService.redisBlacklistPort,
    });
  },
};
