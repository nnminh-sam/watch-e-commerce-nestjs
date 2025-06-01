import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { Request } from 'express';

// * Decorator for getting the user from the request [Decorator Pattern]
export const RequestedUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (!request?.user) throw new BadRequestException('User not found');
    return request.user as TokenPayloadDto;
  },
);
