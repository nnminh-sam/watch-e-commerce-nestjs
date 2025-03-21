import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Spec, SpecSchema } from '@root/models/spec.model';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ id: true })
export class CartItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    unique: true,
    required: true,
  })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ type: [SpecSchema], default: [] })
  spec: Spec[];

  @Prop({ required: true })
  asset: string;

  @Prop({ default: true })
  availability: boolean;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);
CartItemSchema.index({ name: 'text' }, { unique: true });

export { CartItemSchema };
