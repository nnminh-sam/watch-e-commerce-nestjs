import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { GenericApiResponseDto } from '@root/commons/dtos/generic-api-response.dto';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // TODO: [Low] Error details property field is camel case
    const exceptionResponse: any = exception.getResponse();

    response.status(status).json({
      status_code: status,
      message: exceptionResponse.message,
      ...(exceptionResponse?.details && {
        errors: exceptionResponse.details,
      }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
