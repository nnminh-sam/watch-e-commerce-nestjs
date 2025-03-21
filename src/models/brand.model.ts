import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true, collection: 'brands', id: true })
export class Brand {
  @Prop({
    // type: MongooseSchema.Types
    required: true,
    unique: true,
  })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ default: [] })
  assets: string[];

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
