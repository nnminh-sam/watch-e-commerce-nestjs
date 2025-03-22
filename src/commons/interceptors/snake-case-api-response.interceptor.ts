import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isArray, isDate, isObject } from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SnakeCaseApiResponseInterceptor implements NestInterceptor {
  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        return convertToSnakeCase(data);
      }),
    );
  }
}

const toSnakeCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

function convertToSnakeCase(object: Record<string, any>) {
  const keys = Object.keys(object);
  const values = Object.values(object);
  const snakeCaseKeys: string[] = [];
  const snakeCaseValues: any[] = [];
  keys.forEach((key: string, index: number) => {
    snakeCaseKeys.push(toSnakeCase(key));

    const valueAtKey = values.at(index);
    if (isArray(valueAtKey)) {
      snakeCaseValues.push(
        valueAtKey.map((data: Record<string, any>) => convertToSnakeCase(data)),
      );
    } else if (isDate(valueAtKey) || !isObject(valueAtKey)) {
      snakeCaseValues.push(valueAtKey);
    } else if (isObject(valueAtKey)) {
      snakeCaseValues.push(convertToSnakeCase(valueAtKey));
    }
  });
  const transformedObject = Object.fromEntries(
    snakeCaseKeys.map((key: string, index: number) => [
      key,
      snakeCaseValues[index],
    ]),
  );

  return transformedObject;
}
