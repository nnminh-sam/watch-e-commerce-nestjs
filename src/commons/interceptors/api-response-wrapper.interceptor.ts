import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isArray } from 'class-validator';
import { map, Observable } from 'rxjs';

@Injectable()
export class ApiResponseWrapperInterceptor implements NestInterceptor {
  constructor(private readonly key: string = 'data') {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next
      .handle()
      .pipe(map((data) => wrapResponse({ key: this.key, data, context })));
  }
}

const wrapResponse = ({ key, data, context }: any) => {
  const metadata: Record<string, any> = {};
  metadata[key] = data;
  metadata['timestamp'] = new Date().toISOString();
  metadata['path'] = context.switchToHttp().getRequest().path;

  if (isArray(data)) {
    metadata['count'] = data.length;
  }
  return metadata;
};
