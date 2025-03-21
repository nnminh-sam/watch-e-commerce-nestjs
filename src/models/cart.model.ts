import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '@root/models/user.model';
import { CartItem, CartItemSchema } from '@root/models/cart-item.model';

export type CartDocument = Document & Cart;

@Schema({ timestamps: true, id: true, collection: 'carts' })
export class Cart {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    unique: true,
  })
  user: string;

  @Prop({ default: 0 })
  total: number;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

export { CartSchema };
