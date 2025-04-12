import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '@root/models';
import { DeliveryInformation } from '@root/models/delivery-information.model';
import { OrderStatusEnum } from '@root/models/enums/order-status.enum';
import { PaymentMethod } from '@root/models/enums/payment-method.enum';
import { OrderDetail } from '@root/models/order-detail.model';
import { User } from '@root/models/user.model';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export class Order extends BaseModel {
  @ApiProperty({
    type: String,
    description: 'User ID of the order owner',
    example: '612e3b62c9e77a1a1c0a4b9d',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @ApiProperty({
    type: String,
    description: 'Unique identifier for the order',
  })
  @Prop({ required: true })
  orderNumber: string;

  @ApiProperty({
    type: DeliveryInformation,
    description: 'Delivery information for the order',
    name: 'delivery_information',
  })
  @Prop({
    type: DeliveryInformation,
    required: true,
  })
  deliveryInformation: DeliveryInformation;

  @ApiProperty({
    type: [OrderDetail],
    description: 'List of items in the order',
    example: [],
  })
  @Prop({
    type: [OrderDetail],
    required: true,
  })
  details: OrderDetail[];

  @ApiProperty({
    type: Number,
    description: 'Total amount for the order',
    example: 149.99,
  })
  @Prop({ required: true })
  total: number;

  @ApiProperty({
    enum: OrderStatusEnum,
    description: 'Current status of the order',
    example: OrderStatusEnum.PENDING,
    name: 'status',
  })
  @Prop({
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  status: OrderStatusEnum;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Payment method used for the order',
    example: PaymentMethod.CASH,
    name: 'payment_method',
  })
  @Prop({ enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  static transform(doc: any) {
    doc = BaseModel.transform(doc);

    if (doc.userId) {
      doc.userId = doc.userId.toString();
    }

    if (doc.deliveryInformation) {
      doc.deliveryInformation.id = doc.deliveryInformation._id.toString();
      delete doc.deliveryInformation._id;
    }

    if (doc.details && doc.details.length > 0) {
      doc.details = doc.details.map((detail: any) =>
        OrderDetail.transform(detail),
      );
    }

    return doc;
  }
}

const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNumber: 'text' }, { unique: true });

OrderSchema.set('toJSON', {
  transform: (_, ret) => Order.transform(ret),
});
OrderSchema.post('findOne', (doc: any) => {
  return Order.transform(doc);
});
OrderSchema.post('find', (docs: any) => {
  if (!docs || docs.length === 0) {
    return docs;
  }
  return docs.map((doc: any) => Order.transform(doc));
});

export { OrderSchema };
