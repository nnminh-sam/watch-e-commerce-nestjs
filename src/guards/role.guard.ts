import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Provider,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@root/user/entities/role.enum';
import { Observable } from 'rxjs';
import { APP_GUARD } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get(Role, context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    return roles.some((role: string) => user.roles?.includes(role));
  }
}

export const RoleGuardProviderConfig: Provider = {
  provide: APP_GUARD,
  useClass: RoleGuard,
};
