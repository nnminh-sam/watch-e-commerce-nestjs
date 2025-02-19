import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentSchema } from '@root/product/entities/comment.model';
import { ProductStatus } from '@root/product/entities/product-status.enum';
import { Spec, SpecSchema } from '@root/product/entities/spec.model';

export type ProductDocument = Document & Product;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ require: true, unique: true })
  code: string;

  @Prop({ require: true })
  description: string;

  @Prop({ require: true })
  price: number;

  @Prop({ default: 0 })
  sold: number;

  @Prop({ default: [] })
  assets: string[];

  @Prop({ type: SpecSchema, default: [] })
  spec: Spec[];

  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.AVAILABLE })
  status: ProductStatus;

  @Prop({ default: true })
  customerVisible: boolean;

  @Prop({ type: CommentSchema, default: [] })
  comments: Comment[];

  @Prop({ default: 0 })
  totalComments: number;
}

const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ 'spec.key': 1, 'spec.value': 1 });

export { ProductSchema };
