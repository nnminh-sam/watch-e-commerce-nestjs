import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true, collection: 'brands', id: true })
export class Brand {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: false })
  slug: string;

  @Prop()
  description: string;

  @Prop({ default: [] })
  assets: string[];

  @Prop({ default: null })
  deletedAt: Date;
}

const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

export { BrandSchema };
