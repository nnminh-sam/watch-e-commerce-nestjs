import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isArray, isDate, isObject, isString } from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SnakeCaseApiResponseInterceptor implements NestInterceptor {
  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(map((data) => convertToSnakeCase(data)));
  }
}

const toSnakeCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

function convertToSnakeCase(data: any): any {
  if (isString(data) || isDate(data)) {
    return data;
  }

  if (isObject(data)) {
    const keys: string[] = Object.keys(data);
    const values: any[] = Object.values(data);
    const snakeCaseKeys: string[] = [];
    const snakeCaseValues: any[] = [];

    keys.forEach((key: string, index: number) => {
      snakeCaseKeys.push(toSnakeCase(key));
      const valueAtKey: any = values.at(index);
      snakeCaseValues.push(convertToSnakeCase(valueAtKey));
    });

    const transformedObject = Object.fromEntries(
      snakeCaseKeys.map((key: string, index: number) => [
        key,
        snakeCaseValues[index],
      ]),
    );

    return transformedObject;
  }

  if (isArray(data)) {
    return data.map((d: any) => convertToSnakeCase(d));
  }
}
