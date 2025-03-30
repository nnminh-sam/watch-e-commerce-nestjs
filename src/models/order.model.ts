import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '@root/models';
import { DeliveryInformation } from '@root/models/delivery-information.model';
import { OrderStatusEnum } from '@root/models/enums/order-status.enum';
import { OrderDetail } from '@root/models/order-detail.model';
import { Document, Mongoose } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, id: true, collection: 'orders' })
export class Order extends BaseModel {
  @Prop({ required: true })
  orderNumber: string;

  @Prop({
    type: DeliveryInformation,
    required: true,
  })
  delivery: DeliveryInformation;

  @Prop({
    type: [OrderDetail],
    required: true,
  })
  details: OrderDetail[];

  @Prop({ required: true })
  total: number;

  @Prop({ default: OrderStatusEnum.PENDING })
  status: OrderStatusEnum;
}

const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNumber: 'text' }, { unique: true });

function transformDocument(doc: any) {
  doc.id = doc._id.toString();
  const formatedDetails = doc.details.map((detail: any) => {
    detail.id = detail._id.toString();
    delete detail._id;
    return detail;
  });
  doc.details = formatedDetails;
  delete doc._id;
  return doc;
}

OrderSchema.post('findOne', (doc: OrderDocument) => transformDocument(doc));

OrderSchema.post('find', (docs: any) =>
  docs.map((doc: any) => transformDocument(doc)),
);

export { OrderSchema };
