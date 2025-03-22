import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true, collection: 'brands', id: true })
export class Brand {
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
}

const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.index({
  name: 'text',
});

BrandSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

export { BrandSchema };
