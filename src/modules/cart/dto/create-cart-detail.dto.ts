import { ApiProperty } from '@nestjs/swagger';
import { Spec } from '@root/models/spec.model';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { array } from 'joi';

export class CreateCartDetailDto {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c89',
    description: 'Product ID',
  })
  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid product ID' })
  productId: string;

  @ApiProperty({ example: 3, description: 'Product quantity', required: false })
  @IsOptional()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: [
      '60d21b4667d0d8992e610c89',
      '60d21b4667d0d8992e610c89',
      '60d21b4667d0d8992e610c89',
    ],
    description: 'User wanted product specification IDs',
    type: 'array',
    required: false,
    name: 'spec_ids',
  })
  @IsOptional()
  @IsArray()
  specIds: string[];
}
