import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const claims: TokenPayloadDto = request?.user as TokenPayloadDto;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        const requestedUser: string = claims?.sub || 'public';
        this.logger.log({
          message: `[Requested: ${requestedUser}] ${method} ${url} - ${ms}ms`,
          context: 'Application',
          duration: ms,
          path: url,
          method,
          ip,
        });
      }),
    );
  }
}
