import { PaymentMethod } from '@root/models/enums/payment-method.enum';
import { TransactionStatus } from '@root/models/enums/transaction-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
