import { Spec } from '@root/models/spec.model';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCartItemDto {
  @IsMongoId()
  @IsNotEmpty()
  cartId: string;

  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsArray()
  @IsNotEmpty()
  spec: Spec[];
}
