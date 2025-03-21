import { Inject, Module } from '@nestjs/common';
import { JwtManagerService } from './jwt-manager.service';
import { EnvironmentModule } from '@root/environment/environment.module';
import { EnvironmentService } from '@root/environment/environment.service';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@root/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: ({ jwtSecret, jwtExpiresIn }: EnvironmentService) => ({
        secret: jwtSecret,
        signOptions: { expiresIn: jwtExpiresIn },
      }),
    }),
  ],
  providers: [JwtManagerService],
  exports: [JwtManagerService],
})
export class JwtManagerModule {}
