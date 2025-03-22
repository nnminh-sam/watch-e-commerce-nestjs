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
  @ApiProperty({ example: '60d21b4667d0d8992e610c85', description: 'Cart ID' })
  @IsMongoId()
  @IsString()
  cartId: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c86',
    description: 'Product ID',
  })
  @IsMongoId()
  @IsString()
  productId: string;

  @ApiProperty({ example: 199.99, description: 'Item price' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: [{ key: 'Size', value: 'M' }],
    description: 'Specifications for the product',
  })
  @IsArray()
  @IsNotEmpty()
  spec: Spec[];
}
