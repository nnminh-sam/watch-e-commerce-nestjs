import { ApiProperty } from '@nestjs/swagger';
import { Spec } from '@root/models/spec.model';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c86',
    description:
      'Product ID at the moment where the product is added into the cart. Other product information such as price or name can be changed',
  })
  @IsMongoId()
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: [{ key: 'Size', value: 'M' }],
    description: 'User selected specifications of the product',
  })
  @IsArray()
  @IsNotEmpty()
  spec: Spec[];
}
