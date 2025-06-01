import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Spec, SpecSchema } from '@root/models/spec.model';
import { ApiProperty } from '@nestjs/swagger';
import { BaseModel } from '@root/models';

@Schema({ timestamps: true })
export class CartDetail extends BaseModel {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c90',
    description: 'Product ID',
    name: 'product_id',
  })
  @Prop({ required: true })
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
    required: false,
  })
  @Prop({ type: [SpecSchema], default: [], required: false })
  specs?: Spec[];

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

  static transform(doc: any): any {
    doc = BaseModel.transform(doc);
    if (doc.specs) {
      doc.specs = doc.specs.map((spec: any) => Spec.transform(spec));
    }
    return doc;
  }
}

const CartDetailSchema = SchemaFactory.createForClass(CartDetail);

CartDetailSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => CartDetail.transform(ret),
});
CartDetailSchema.post('findOne', (doc: any) => CartDetail.transform(doc));
CartDetailSchema.post('find', (docs: any) =>
  docs.map((doc: any) => CartDetail.transform(doc)),
);

export { CartDetailSchema };
