import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export class ErrorHandlingExecution {
  fn: () => Promise<any>;

  catchFn?: (error: any) => any;

  logSystem?: Logger;
}

export async function executeWithErrorHandling({
  fn,
  catchFn,
  logSystem,
}: ErrorHandlingExecution) {
  return await fn().catch((error: any) => {
    const logger: any = logSystem || console;

    if (catchFn) {
      return catchFn(error);
    }

    logger.error(error.message);

    if (error.code === 11000 || error.code === 'E11000') {
      throw new BadRequestException(error.message);
    }

    switch (error.name) {
      case 'ValidationError':
        throw new BadRequestException('Validation failed');
      case 'CastError':
        throw new BadRequestException(error.message);
      default:
        throw new InternalServerErrorException(error.message);
    }
  });
}
