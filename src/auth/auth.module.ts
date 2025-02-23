import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@root/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '@root/app-config/app-config.module';
import { AppConfigService } from '@root/app-config/app-config.service';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '60s' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
