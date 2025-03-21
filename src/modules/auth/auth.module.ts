import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@root/database/database.module';
import { LocalStrategy } from '@root/modules/auth/strategies/local.strategy';
import { JwtStrategy } from '@root/modules/auth/strategies/jwt.strategy';
import { UserModule } from '@root/modules/user/user.module';
import { EnvironmentModule } from '@root/environment/environment.module';
import { EnvironmentService } from '@root/environment/environment.service';
import { JwtManagerModule } from '@root/modules/jwt-manager/jwt-manager.module';

@Module({
  imports: [EnvironmentModule, DatabaseModule, UserModule, JwtManagerModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
