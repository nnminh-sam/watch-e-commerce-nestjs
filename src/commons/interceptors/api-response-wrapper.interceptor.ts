import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GenericApiResponseDto } from '@root/commons/dtos/generic-api-response.dto';
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

// TODO: Refactor logic of this function
const wrapResponse = ({ key, data, context }: any) => {
  const isGenericApiResponse = data instanceof GenericApiResponseDto;
  if (isGenericApiResponse) {
    const response: Record<string, any> = {};
    response[key] = data.data;
    if (data?.pagination) {
      response['pagination'] = data.pagination;
    }
    response['timestamp'] = new Date().toISOString();
    response['path'] = context.switchToHttp().getRequest().path;
    if (isArray(data.data)) {
      response['count'] = data?.data.length;
    }
    return response;
  }

  const metadata: Record<string, any> = {};
  metadata[key] = data;
  metadata['timestamp'] = new Date().toISOString();
  metadata['path'] = context.switchToHttp().getRequest().path;

  if (isArray(data)) {
    metadata['count'] = data.length;
  }
  return metadata;
};
