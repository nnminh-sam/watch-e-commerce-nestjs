import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from '@root/app-config/app-config.module';
import { AppConfigService } from '@root/app-config/app-config.service';

export const MongooseModuleProvider: DynamicModule =
  MongooseModule.forRootAsync({
    imports: [AppConfigModule],
    inject: [AppConfigService],
    useFactory: async (appConfigService: AppConfigService) => ({
      uri: appConfigService.databaseUrl,
    }),
  });
