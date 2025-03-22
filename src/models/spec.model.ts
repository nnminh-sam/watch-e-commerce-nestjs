import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SpecType } from '@root/models/enums/spec-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ id: true })
export class Spec {
  @ApiProperty({ example: 'Color', description: 'Specification key' })
  @Prop()
  key: string;

  @ApiProperty({ example: 'Red', description: 'Specification value' })
  @Prop()
  value: string;

  @ApiProperty({
    example: 'URL',
    description: 'Specification type',
    enum: SpecType,
  })
  @Prop({ type: String, enum: SpecType, default: SpecType.NORMAL })
  type: SpecType;

  @ApiProperty({
    example: 'https://example.com/spec-image.jpg',
    description: 'URL for the specification image',
    required: false,
  })
  @Prop()
  url?: string;
}

const SpecSchema = SchemaFactory.createForClass(Spec);

SpecSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    return ret;
  },
});

export { SpecSchema };
