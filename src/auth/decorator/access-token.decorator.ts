import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export const AccessToken = createParamDecorator(
  (_: any, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const authHeader = request.header('Authorization'); // Correct header name

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Invalid or missing Authorization header');
    }

    const accessToken: string = authHeader.split(' ')[1];
    return accessToken;
  },
);
