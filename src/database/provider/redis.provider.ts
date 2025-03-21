import { Provider } from '@nestjs/common';
import { EnvironmentService } from '@root/environment/environment.service';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  inject: [EnvironmentService],
  useFactory: (environmentService: EnvironmentService) => {
    return new Redis({
      host: environmentService.redisHost,
      port: environmentService.redisPort,
      password: environmentService.redisPassword,
    });
  },
};
