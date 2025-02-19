import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SpecType } from '@root/product/entities/spec-type.enum';

@Schema()
export class Spec {
  @Prop()
  key: string;

  @Prop()
  value: string;

  @Prop({ type: String, enum: SpecType, default: SpecType.STRING_VALUE })
  type: SpecType;
}

const SpecSchema = SchemaFactory.createForClass(Spec);

export { SpecSchema };
