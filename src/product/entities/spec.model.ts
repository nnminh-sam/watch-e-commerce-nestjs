import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SpecType } from '@root/product/entities/spec-type.enum';

@Schema({ id: true })
export class Spec {
  @Prop()
  key: string;

  @Prop()
  value: string;

  @Prop({ type: String, enum: SpecType, default: SpecType.NORMAL })
  type: SpecType;

  @Prop()
  url?: string;
}

const SpecSchema = SchemaFactory.createForClass(Spec);

SpecSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret.customerVisible;
    delete ret._id;
    return ret;
  },
});

export { SpecSchema };
