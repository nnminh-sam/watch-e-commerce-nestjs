import { OmitType } from '@nestjs/mapped-types';
import { CreateCartDetailDto } from '@root/modules/cart/dto/create-cart-detail.dto';

export class UpdateCartDetailDto extends OmitType(CreateCartDetailDto, [
  'productId',
]) {}
