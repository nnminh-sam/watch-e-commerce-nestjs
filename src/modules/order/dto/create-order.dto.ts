import { ApiProperty } from '@nestjs/swagger';
import { CreateDeliveryAddressDto } from '../../user/dto/create-delivery-address.dto';
import { PaymentMethod } from '@root/models/enums/payment-method.enum';
import { IsArray, IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateOrderDto extends CreateDeliveryAddressDto {
  @ApiProperty({
    description: 'List of checking out cart detail ids',
    isArray: true,
    name: 'cart_detail_ids',
    example: [],
  })
  @IsNotEmpty()
  @IsArray()
  cartDetailIds: string[];

  @ApiProperty({
    description: 'User payment method of choice',
    name: 'payment_method',
    default: PaymentMethod.CASH,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
