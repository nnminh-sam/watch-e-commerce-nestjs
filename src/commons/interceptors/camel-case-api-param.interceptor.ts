import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { camelCase, mapKeys } from 'lodash';
import { Observable } from 'rxjs';

@Injectable()
export class CamelCaseApiParamInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.query) {
      const camelCaseQuery = this.convertKeysToCamelCase(request.query);
      Object.keys(camelCaseQuery).forEach((key) => {
        request.query[key] = camelCaseQuery[key];
      });
    }
    return next.handle();
  }

  private convertKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertKeysToCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
      return mapKeys(obj, (_, key: any) => camelCase(key));
    }
    return obj;
  }
}
