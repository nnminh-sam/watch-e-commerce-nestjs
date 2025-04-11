import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '@root/models';
import { Spec } from '@root/models/spec.model';
import { Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class OrderDetail extends BaseModel {
  @ApiProperty({
    type: String,
    description: 'Product ID for the order detail',
    example: '612e3b62c9e77a1a1c0a4b9d',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
  })
  productId: string;

  @ApiProperty({
    type: String,
    description: 'Name of the product',
    example: 'Luxury Watch',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    type: [Spec],
    description: 'List of selected specifications',
    example: [],
    name: 'specs',
  })
  @Prop({ required: true })
  specs: Spec[];

  @ApiProperty({
    type: Number,
    description: 'Quantity of the product',
    example: 2,
  })
  @Prop({ required: true })
  quantity: number;

  @ApiProperty({
    type: Number,
    description: 'Price of the product',
    example: 59.99,
  })
  @Prop({ required: true })
  price: number;

  @ApiProperty({
    type: String,
    description: 'Asset (image URL) of the product',
    example: 'https://example.com/watch.jpg',
  })
  @Prop({ required: true })
  asset: string;

  static transform(doc: any) {
    doc = BaseModel.transform(doc);

    if (doc.productId) {
      doc.productId = doc.productId.toString();
    }

    if (doc.specs) {
      doc.specs = doc.specs.map((spec: any) => Spec.transform(spec));
    }

    return doc;
  }
}

const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
OrderDetailSchema.set('toJSON', {
  transform: (_, ret) => OrderDetail.transform(ret),
});
OrderDetailSchema.post('findOne', (doc: any) => OrderDetail.transform(doc));
OrderDetailSchema.post('find', (docs: any) => {
  if (!docs || docs.lenght === 0) {
    return docs;
  }
  return docs.map((doc: any) => OrderDetail.transform(doc));
});

export { OrderDetailSchema };
