import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BaseModel } from '@root/models';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true, collection: 'brands' })
export class Brand extends BaseModel {
  @ApiProperty({ example: 'Rolex', description: 'The name of the brand' })
  @Prop({
    required: true,
    unique: true,
  })
  name: string;

  @ApiProperty({
    example: 'rolex',
    description: 'The unique slug for the brand',
  })
  @Prop({ required: true, unique: true })
  slug: string;

  @ApiProperty({
    example: 'Luxury watch brand',
    description: 'Description of the brand',
    required: false,
  })
  @Prop()
  description: string;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of asset URLs',
    required: false,
  })
  @Prop({ default: [] })
  assets: string[];

  @ApiProperty({
    example: null,
    description: 'Timestamp when the brand was deleted',
    required: false,
  })
  @Prop({ default: null })
  deletedAt: Date;

  static transform(doc: any): any {
    return BaseModel.transform(doc);
  }
}

const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.index({ name: 'text' });

BrandSchema.post('findOne', (doc: any) => Brand.transform(doc));
BrandSchema.post('findOneAndUpdate', (doc: any) => Brand.transform(doc));
BrandSchema.post('find', (docs: any) => {
  if (!docs || docs.length === 0) {
    return docs;
  }
  return docs.map((doc: any) => Brand.transform(doc));
});
BrandSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => Brand.transform(ret),
});

export { BrandSchema };
