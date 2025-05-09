import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '@root/database/database.module';
import { LocalStrategy } from '@root/modules/auth/strategies/local.strategy';
import { JwtStrategy } from '@root/modules/auth/strategies/jwt.strategy';
import { UserModule } from '@root/modules/user/user.module';
import { EnvironmentModule } from '@root/environment/environment.module';
import { JwtManagerModule } from '@root/modules/jwt-manager/jwt-manager.module';
import { LoggerModule } from '@root/modules/logger/logger.module';
import { MailingModule } from '@root/modules/mailing/mailing.module';

@Module({
  imports: [
    EnvironmentModule,
    DatabaseModule,
    UserModule,
    JwtManagerModule,
    LoggerModule,
    MailingModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
