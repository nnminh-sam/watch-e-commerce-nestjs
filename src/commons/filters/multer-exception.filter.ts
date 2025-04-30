import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch(MulterError, Error)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(error: MulterError | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let message = error.message;

    if (error instanceof MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_COUNT':
          message = 'Maximum number of files exceeded';
          break;
        case 'LIMIT_FILE_SIZE':
          message = 'File too large';
          break;
        default:
          message = 'File upload error';
      }
    }

    response.status(status).json({
      status_code: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
