import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Spec, SpecSchema } from '@root/models/spec.model';
import { Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ id: true })
export class CartItem {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c90',
    description: 'Cart item ID',
  })
  id?: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c90',
    description: 'Product ID',
    name: 'product_id',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
  })
  productId: string;

  @ApiProperty({ example: 'Luxury Watch', description: 'Product name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 299.99, description: 'Product price' })
  @Prop({ required: true })
  price: number;

  @ApiProperty({ example: 2, description: 'Quantity in cart' })
  @Prop({ default: 1 })
  quantity: number;

  @ApiProperty({
    description: 'Product specifications',
    type: [Spec],
    name: 'spec_list',
  })
  @Prop({ type: [SpecSchema], default: [] })
  specList: Spec[];

  @ApiProperty({
    example: 'image-url.jpg',
    description: 'Product asset URL',
    type: String,
  })
  @Prop({ required: true })
  asset: string;

  @ApiProperty({
    example: true,
    description: 'Product availability',
    type: Boolean,
  })
  @Prop({ default: true })
  availability: boolean;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

export { CartItemSchema };
