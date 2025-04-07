import { BaseRequestFilterDto } from '@root/commons/dtos/base-request-filter.dto';
import { OrderStatusEnum } from '@root/models/enums/order-status.enum';
import { PaymentMethod } from '@root/models/enums/payment-method.enum';

export class FindOrderDto extends BaseRequestFilterDto {
  orderNumber?: string;

  fromDate?: string;

  toDate?: string;

  status?: OrderStatusEnum;

  paymentMethod?: PaymentMethod;
}
