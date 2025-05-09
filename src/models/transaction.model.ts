import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseModel } from '@root/models';
import { PaymentMethod } from '@root/models/enums/payment-method.enum';
import { TransactionStatus } from '@root/models/enums/transaction-status.enum';
import { Order } from '@root/models/order.model';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = Document & Transaction;

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction extends BaseModel {
  @ApiProperty({
    name: 'order_id',
    description: 'Order ID of the transaction',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Order.name,
    required: true,
    unique: true,
  })
  orderId: string;

  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
  })
  @Prop({
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Transaction amount',
  })
  @Prop({ required: true })
  amount: number;

  @ApiProperty({
    name: 'payment_method',
    description: 'Payment method of the transaction',
    enum: PaymentMethod,
  })
  @Prop({
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  static transform(doc: any) {
    return BaseModel.transform(doc);
  }
}

const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.post('find', (docs: any[]) => {
  if (!docs || docs.length === 0) return docs;
  return docs.map((doc: any) => Transaction.transform(doc));
});
TransactionSchema.post('findOne', (doc: any) => Transaction.transform(doc));
TransactionSchema.set('toJSON', {
  transform: (_, ret) => Transaction.transform(ret),
});

export { TransactionSchema };
