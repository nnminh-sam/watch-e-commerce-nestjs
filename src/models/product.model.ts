import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Brand } from '@root/models/brand.model';
import { Category } from '@root/models/category.model';
import { CommentSchema } from '@root/models/comment.model';
import { ProductStatus } from '@root/models/enums/product-status.enum';
import { Spec, SpecSchema } from '@root/models/spec.model';
import { Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Document & Product;

@Schema({ timestamps: true, id: true, collection: 'products' })
export class Product {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ require: true, unique: true })
  code: string;

  @Prop({ require: true })
  description: string;

  @Prop({ require: true })
  price: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Brand.name,
    required: true,
  })
  brand: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  category: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 0 })
  sold: number;

  @Prop({ default: [] })
  assets: string[];

  @Prop({ type: [SpecSchema], default: [] })
  spec: Spec[];

  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.AVAILABLE })
  status: ProductStatus;

  @Prop({ default: true })
  customerVisible: boolean;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @Prop({ default: 0 })
  totalComments: number;
}

export type PopulatedProduct = Product & {
  brand: Brand;
  category: Category;
};

const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ 'spec.key': 1, 'spec.value': 1 });
ProductSchema.index({ name: 'text' });

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.customerVisible;
    return ret;
  },
});

export { ProductSchema };
