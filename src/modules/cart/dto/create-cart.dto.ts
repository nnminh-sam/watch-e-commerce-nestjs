import { CartItem } from '@root/models/cart-item.model';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCartDto {
  @IsString()
  @IsMongoId()
  userId: string;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsOptional()
  items?: CartItem[];
}
