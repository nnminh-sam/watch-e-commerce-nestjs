import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export class MongoIdValidationPipe implements PipeTransform {
  private invalidMessage: string;

  constructor(message: string) {
    this.invalidMessage = message;
  }

  transform(value: any, _: ArgumentMetadata) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(this.invalidMessage);
    }
    return value;
  }
}
