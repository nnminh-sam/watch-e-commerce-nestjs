import { Prop, Schema } from '@nestjs/mongoose';
import { Product } from '@root/models/product.model';
import { Spec } from '@root/models/spec.model';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, id: true })
export class OrderDetail {
  id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
  })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  specs: Spec[];

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  asset: string;
}
