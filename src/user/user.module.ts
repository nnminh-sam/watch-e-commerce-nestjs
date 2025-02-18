import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModelRegistration } from '@root/user/entities/user.model';

@Module({
  imports: [UserModelRegistration],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
