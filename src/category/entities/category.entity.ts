import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  collection: 'categories',
  timestamps: true,
  id: true,
})
export class Category {
  @Prop({ require: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ default: null })
  assets: string[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

export { CategorySchema };
