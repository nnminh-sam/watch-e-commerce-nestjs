import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '@root/models/user.model';
import { CartItem, CartItemSchema } from '@root/models/cart-item.model';
import { ApiProperty } from '@nestjs/swagger';
import { format } from 'path';

export type CartDocument = Cart & Document;

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
    ret.id = ret._id.toString();

    const formatedItemList: any[] = [];
    ret.items.forEach((item: any) => {
      item.productId = item.productId.toString();
      const formatedSpecList: any[] = [];
      item.specList.forEach((spec: any) => {
        if (spec._id) {
          spec.id = spec._id.toString();
          delete spec._id;
        }
        formatedSpecList.push(spec);
      });
      item.specList = formatedSpecList;
      item.id = item._id.toString();
      delete item._id;
      formatedItemList.push(item);
    });

    delete ret.user;
    delete ret._id;
    return ret;
  },
});

CartSchema.post('save', (doc: any) => {
  doc.id = doc._id.toString();

  const formatedItemList: any[] = [];
  doc.items.forEach((item: any) => {
    item.productId = item.productId.toString();
    const formatedSpecList: any[] = [];
    item.specList.forEach((spec: any) => {
      if (spec._id) {
        spec.id = spec._id.toString();
        delete spec._id;
      }
      formatedSpecList.push(spec);
    });
    item.specList = formatedSpecList;
    item.id = item._id.toString();
    delete item._id;
    formatedItemList.push(item);
  });

  delete doc.user;
  delete doc._id;
  return doc;
});

CartSchema.post('findOne', (doc: any) => {
  doc.id = doc._id.toString();

  const formatedItemList: any[] = [];
  doc.items.forEach((item: any) => {
    item.productId = item.productId.toString();
    const formatedSpecList: any[] = [];
    item.specList.forEach((spec: any) => {
      if (spec._id) {
        spec.id = spec._id.toString();
        delete spec._id;
      }
      formatedSpecList.push(spec);
    });
    item.specList = formatedSpecList;
    item.id = item._id.toString();
    delete item._id;
    formatedItemList.push(item);
  });

  delete doc.user;
  delete doc._id;
  return doc;
});

export { CartSchema };
