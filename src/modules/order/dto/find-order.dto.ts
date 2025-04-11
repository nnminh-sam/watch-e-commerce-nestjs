import { ApiProperty } from '@nestjs/swagger';
import { BaseRequestFilterDto } from '@root/commons/dtos/base-request-filter.dto';
import { OrderStatusEnum } from '@root/models/enums/order-status.enum';
import { PaymentMethod } from '@root/models/enums/payment-method.enum';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

export class FindOrderDto extends BaseRequestFilterDto {
  @ApiProperty({
    description: 'ID of the user who placed the order',
    name: 'user_id',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiProperty({
    description: 'The unique identifier for the order',
    name: 'order_number',
    required: false,
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({
    description: 'Filter for orders created from this date (ISO 8601 format)',
    name: 'from_date',
    required: false,
  })
  @IsOptional()
  @IsString()
  fromDate?: Date;

  @ApiProperty({
    description: 'Filter for orders created up to this date (ISO 8601 format)',
    name: 'to_date',
    required: false,
  })
  @IsOptional()
  @IsString()
  toDate?: Date;

  @ApiProperty({
    description: 'Current status of the order',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @ApiProperty({
    description: 'Method of payment used for the order',
    name: 'payment_method',
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
