import { CartItem } from '@root/models/cart-item.model';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCartItemDto } from '@root/modules/cart/dto/create-cart-item.dto';

export class CreateCartDto {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c87',
    description: 'User ID',
    name: 'user_id',
  })
  @IsString()
  @IsMongoId()
  userId: string;

  @ApiProperty({
    example: 599.99,
    description: 'Total cart value',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  total?: number;

  @ApiProperty({
    description: 'List of cart items',
    required: false,
    type: [CartItem],
  })
  @IsOptional()
  items?: CreateCartItemDto[];
}
