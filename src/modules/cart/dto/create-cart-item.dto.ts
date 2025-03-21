import { Spec } from '@root/models/spec.model';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateCartItemDto {
  @IsMongoId()
  @IsString()
  cartId: string;

  @IsMongoId()
  @IsString()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsArray()
  @IsNotEmpty()
  spec: Spec[];
}
