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
  })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Unique product code',
  })
  @Prop({ required: true, unique: true })
  code: string;

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

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Brand ID',
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
  })
  @Prop({ default: 0 })
  stock: number;

  @ApiProperty({
    example: 50,
    description: 'Number of units sold',
  })
  @Prop({ default: 0 })
  sold: number;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of product images',
    type: 'array',
  })
  @Prop({ default: [] })
  assets: string[];

  @ApiProperty({
    description: 'Product specifications',
    type: 'array',
  })
  @Prop({ type: [SpecSchema], default: [] })
  spec: Spec[];

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
    if (!ret) return;

    ret.id = ret._id.toHexString();
    ret.brand = ret.brand.toString();
    ret.category = ret.category.toString();
    delete ret._id;
    return ret;
  },
});

ProductSchema.post('findOne', (doc: any) => {
  if (!doc) {
    return;
  }

  doc.id = doc._id.toHexString();

  doc.brand.id = doc.brand._id.toString();
  delete doc.brand._id;

  doc.category.id = doc.category._id.toString();
  delete doc.category._id;

  doc.spec = doc.spec.map((spec: any) => {
    spec.id = spec._id.toString();
    delete spec._id;
    return spec;
  });

  delete doc._id;
  return doc;
});

ProductSchema.post('find', (docs: any) => {
  if (!docs) return;

  return docs.map((doc: any) => {
    if (!doc) return;

    doc.id = doc._id.toHexString();
    doc.brand = doc.brand.toString();
    doc.category = doc.category.toString();
    delete doc._id;
    return doc;
  });
});

ProductSchema.index({ 'spec.key': 1, 'spec.value': 1 });
ProductSchema.index({ name: 'text' });

export { ProductSchema };
