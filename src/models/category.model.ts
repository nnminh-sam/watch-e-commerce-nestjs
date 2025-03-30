import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '@root/models';

export type CategoryDocument = Category & Document;

@Schema({
  collection: 'categories',
  timestamps: true,
})
export class Category extends BaseModel {
  @ApiProperty({
    example: 'Luxury Watches',
    description: 'Category name',
    name: 'name',
  })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    example: 'High-end watches category',
    description: 'Category description',
    name: 'description',
  })
  @Prop()
  description: string;

  @ApiProperty({
    example: 'luxury-watches',
    description: 'Category slug',
    name: 'slug',
  })
  @Prop({ required: true, unique: true })
  slug: string;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of asset URLs',
    name: 'assets',
  })
  @Prop({ default: [] })
  assets: string[];

  @ApiProperty({
    example: true,
    description: 'Indicates if the category is featured',
    name: 'is_featured',
  })
  @Prop({ default: false })
  isFeatured: boolean;

  @ApiProperty({
    example: null,
    description: 'Timestamp when the category was deleted',
    name: 'deleted_at',
  })
  @Prop({ default: null })
  deletedAt: Date;

  static transform(doc: any): any {
    return BaseModel.transform(doc);
  }
}

const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ name: 'text' });

CategorySchema.post('findOne', (doc: any) => Category.transform(doc));
CategorySchema.post('findOneAndUpdate', (doc: any) => Category.transform(doc));
CategorySchema.post('find', (docs: any) => {
  if (!docs || docs.lenght === 0) {
    return docs;
  }
  return docs.map((doc: any) => Category.transform(doc));
});
CategorySchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => Category.transform(ret),
});

export { CategorySchema };
