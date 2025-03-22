import { ApiProperty } from '@nestjs/swagger';
import { Spec } from '@root/models/spec.model';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: '60d21b4667d0d8992e610c88', description: 'Cart ID' })
  @IsMongoId()
  @IsNotEmpty()
  cartId: string;

  @ApiProperty({ example: '60d21b4667d0d8992e610c89', description: 'Product ID' })
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 3, description: 'Updated quantity' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: [{ key: 'Color', value: 'Red' }], description: 'Updated specifications' })
  @IsArray()
  @IsNotEmpty()
  spec: Spec[];
}
