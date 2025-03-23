import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '@root/models/user.model';
import { CartItem, CartItemSchema } from '@root/models/cart-item.model';
import { ApiProperty } from '@nestjs/swagger';

export type CartDocument = Document & Cart;

@Schema({ timestamps: true, id: true, collection: 'carts' })
export class Cart {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c91',
    description: 'Cart ID',
  })
  id: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c91',
    description: 'User ID associated with the cart',
    type: User,
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    unique: true,
  })
  user: string;

  @ApiProperty({ example: 999.99, description: 'Total cart price' })
  @Prop({ default: 0 })
  total: number;

  @ApiProperty({
    description: 'List of items in the cart',
    type: [CartItem],
  })
  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index(
  { 'items.productId': 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      'items.productId': { $exists: true, $ne: null },
    },
  },
);

CartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

export { CartSchema };
