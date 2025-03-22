import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { camelCase, isPlainObject, mapKeys, mapValues } from 'lodash';

export class CamelCaseApiRequestInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.body && typeof request.body === 'object') {
      request.body = this.convertKeysToCamelCase(request.body);
    }
    return next.handle();
  }

  private convertKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertKeysToCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
      return mapKeys(obj, (_: any, key: any) => camelCase(key));
    }
    return obj;
  }
}
