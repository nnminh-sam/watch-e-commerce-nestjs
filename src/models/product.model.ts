import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Brand } from '@root/models/brand.model';
import { Category } from '@root/models/category.model';
import { CommentSchema } from '@root/models/comment.model';
import { ProductStatus } from '@root/models/enums/product-status.enum';
import { Spec, SpecSchema } from '@root/models/spec.model';
import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '@root/models/comment.model';
import { BaseModel } from '@root/models';

export type ProductDocument = Document & Product;

@Schema({
  timestamps: true,
  collection: 'products',
  autoIndex: false,
})
export class Product extends BaseModel {
  @ApiProperty({
    example: 'Luxury Watch',
    description: 'Product name',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Standard Product Unit',
  })
  @Prop({ required: true })
  spu: string;

  @ApiProperty({
    example: 'LW12345-44MM-LEATHER',
    description: 'Stock Keeping Unit',
  })
  @Prop({ required: true, unique: true })
  sku: string;

  @ApiProperty({
    example: 'A high-end luxury watch',
    description: 'Product description',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: 4999.99,
    description: 'Product price',
  })
  @Prop({ required: true })
  price: number;

  @ApiProperty({ description: 'Brand', type: Brand })
  @Prop({ type: Brand, required: true })
  brand: Brand;

  @ApiProperty({ description: 'Categories', type: [Category] })
  @Prop({ type: [Category], required: true })
  categories: Category[];

  @ApiProperty({ example: 100, description: 'Available stock quantity' })
  @Prop({ default: 0 })
  stock: number;

  @ApiProperty({ example: 50, description: 'Number of units sold' })
  @Prop({ default: 0 })
  sold: number;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of product images',
    type: 'array',
  })
  @Prop({ default: [] })
  assets: string[];

  @ApiProperty({ description: 'Product specifications', type: 'array' })
  @Prop({ type: [SpecSchema], default: [] })
  specs: Spec[];

  @ApiProperty({
    example: ProductStatus.AVAILABLE,
    enum: ProductStatus,
    description: 'Product status',
  })
  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.AVAILABLE })
  status: ProductStatus;

  @ApiProperty({
    example: true,
    description: 'Is product visible to customers',
    name: 'customer_visible',
  })
  @Prop({ default: true })
  customerVisible: boolean;

  @ApiProperty({
    description: 'Customer comments on the product',
    name: 'comments',
    type: [Comment],
  })
  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @ApiProperty({
    example: 10,
    description: 'Total number of comments',
    name: 'total_comments',
  })
  @Prop({ default: 0 })
  totalComments: number;

  static transform(doc: any): any {
    if (!doc) {
      return doc;
    }

    doc = BaseModel.transform(doc);

    if (doc.brand) {
      doc.brand = Brand.transform(doc.brand);
    }

    if (doc.categories) {
      doc.categories = doc.categories.map((category: any) =>
        Category.transform(category),
      );
    }

    if (doc.comments) {
      doc.comments = doc.comments.map((comment: any) =>
        Comment.transform(comment),
      );
    }

    if (doc.specs) {
      doc.specs = doc.specs.map((spec: any) => Spec.transform(spec));
    }
    return doc;
  }
}

const ProductSchema = SchemaFactory.createForClass(Product);

// TODO: [Low] Test performance with and without specs compound index
ProductSchema.index({ 'specs.key': 1, 'specs.value': 1 }, { unique: true });
ProductSchema.index({ name: 'text' }, { unique: true });
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => Product.transform(ret),
});
ProductSchema.post('findOne', (doc: any) => Product.transform(doc));
ProductSchema.post('find', (docs: any) => {
  if (!docs || docs.length === 0) {
    return docs;
  }
  return docs.map((doc: any) => Product.transform(doc));
});

export { ProductSchema };
