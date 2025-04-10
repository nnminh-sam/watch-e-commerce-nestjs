import { BaseRequestFilterDto } from '@root/commons/dtos/base-request-filter.dto';
import { PaymentMethod } from '@root/models/enums/payment-method.enum';
import { TransactionStatus } from '@root/models/enums/transaction-status.enum';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindTransactionDto extends BaseRequestFilterDto {
  @ApiProperty({
    description: 'ID of the user who owns the transaction',
    name: 'user_id',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiPropertyOptional({
    name: 'order_id',
    description: 'ID of the related order',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Status of the transaction',
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    name: 'min_amount',
    description: 'Minimum transaction amount to filter by',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional({
    name: 'max_amount',
    description: 'Maximum transaction amount to filter by',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiPropertyOptional({
    name: 'payment_method',
    description: 'Payment method used in the transaction',
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
