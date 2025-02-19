import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
class Spec {
  @Prop()
  key: string;

  @Prop()
  value: string;
}

const SpecSchema = SchemaFactory.createForClass(Spec);

export type ProductDocument = Document & Product;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ require: true, unique: true })
  code: string;

  @Prop({ require: true })
  description: string;

  @Prop({ default: 0 })
  sold: number;

  @Prop({ default: [] })
  assets: string[];

  @Prop({
    type: SpecSchema,
    default: [],
  })
  spec: Spec[];
}

const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ 'spec.key': 1, 'spec.value': 1 });

export { ProductSchema };
