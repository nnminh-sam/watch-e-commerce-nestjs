import { Type } from '@nestjs/common';

export class ApiDocDto {
  summary: string;
  wraperObjectKey?: string;
  wraperObjectSchema?: Type<any>;
  okResponseDescription?: string = 'Success';
  unauthorizedResponseDescription?: string = 'Unauthorized request';
  badRequestResponseDescription?: string = 'Bad request';
}
