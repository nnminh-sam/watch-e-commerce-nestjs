import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '@root/models/user.model';
import { CartDetail, CartDetailSchema } from '@root/models/cart-detail.model';
import { ApiProperty } from '@nestjs/swagger';
import { format } from 'path';
import { BaseModel } from '@root/models';
import { PartialType } from '@nestjs/mapped-types';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true, id: true, collection: 'carts' })
export class Cart extends BaseModel {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c91',
    description: 'User ID associated with the cart',
    type: User,
    name: 'user_id',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    unique: true,
  })
  userId: string;

  @ApiProperty({ example: 999.99, description: 'Total cart price' })
  @Prop({ default: 0 })
  total: number;

  @ApiProperty({
    description: 'List of items in the cart',
    type: [CartDetail],
  })
  @Prop({ type: [CartDetailSchema], default: [] })
  details: CartDetail[];

  transform(doc: any): any {
    doc = BaseModel.transform(doc);
    if (doc.details) {
      doc.details = doc.details.map((detail: any) =>
        CartDetail.transform(detail),
      );
    }
    return doc;
  }
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
  transform: (_, ret) => Cart.transform(ret),
});
CartSchema.post('save', (doc: any) => Cart.transform(doc));
CartSchema.post('findOne', (doc: any) => Cart.transform(doc));

export { CartSchema };
