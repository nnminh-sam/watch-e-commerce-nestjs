import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { HasRoles } from '@root/user/decorator/has-role.decorator';
import { Request } from 'express';
import { TokenPayloadDto } from '@root/auth/dto/token-payload.dto';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get(HasRoles, context.getHandler());
    if (!roles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as TokenPayloadDto;
    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    return roles.includes(user.role);
  }
}
