import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Brand } from '@root/models/brand.model';
import { Category } from '@root/models/category.model';
import { CommentSchema } from '@root/models/comment.model';
import { ProductStatus } from '@root/models/enums/product-status.enum';
import { Spec, SpecSchema } from '@root/models/spec.model';
import { Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '@root/models/comment.model';

export type ProductDocument = Document & Product;

@Schema({ timestamps: true, id: true, collection: 'products' })
export class Product {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c91',
    description: 'Product ID',
  })
  id: string;

  @ApiProperty({
    example: 'Luxury Watch',
    description: 'Product name',
    name: 'name',
  })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Unique product code',
    name: 'code',
  })
  @Prop({ required: true, unique: true })
  code: string;

  @ApiProperty({
    example: 'A high-end luxury watch',
    description: 'Product description',
    name: 'description',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: 4999.99,
    description: 'Product price',
    name: 'price',
  })
  @Prop({ required: true })
  price: number;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Brand ID',
    name: 'brand',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Brand.name,
    required: true,
  })
  brand: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c86',
    description: 'Category ID',
    name: 'category',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  category: string;

  @ApiProperty({
    example: 100,
    description: 'Available stock quantity',
    name: 'stock',
  })
  @Prop({ default: 0 })
  stock: number;

  @ApiProperty({
    example: 50,
    description: 'Number of units sold',
    name: 'sold',
  })
  @Prop({ default: 0 })
  sold: number;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of product images',
    name: 'assets',
  })
  @Prop({ default: [] })
  assets: string[];

  @ApiProperty({
    description: 'Product specifications',
    name: 'spec',
    type: [Spec],
  })
  @Prop({ type: [SpecSchema], default: [] })
  spec: Spec[];

  @ApiProperty({
    example: ProductStatus.AVAILABLE,
    enum: ProductStatus,
    description: 'Product status',
    name: 'status',
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
}

export type DetailedProduct = Product & {
  brand: Brand;
  category: Category;
};

const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id.toHexString();
    delete ret._id;
    return ret;
  },
});

ProductSchema.index({ 'spec.key': 1, 'spec.value': 1 });
ProductSchema.index({ name: 'text' });

export { ProductSchema };
