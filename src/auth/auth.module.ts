import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@root/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '@root/app-config/app-config.module';
import { AppConfigService } from '@root/app-config/app-config.service';
import { DatabaseModule } from '@root/database/database.module';
import { LocalStrategy } from '@root/auth/strategies/local.strategy';
import { JwtStrategy } from '@root/auth/strategies/jwt.strategy';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
