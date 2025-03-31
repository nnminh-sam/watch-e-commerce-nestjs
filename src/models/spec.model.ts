import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SpecType } from '@root/models/enums/spec-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { BaseModel } from '@root/models';

@Schema({ timestamps: true })
export class Spec extends BaseModel {
  @ApiProperty({ example: 'SIZE', description: 'Specification key' })
  @Prop()
  key: string;

  @ApiProperty({ example: '44MM', description: 'Specification value' })
  @Prop()
  value: string;

  @ApiProperty({
    example: 'URL',
    description:
      'Specification type. Normal for key value pair and URL for URL value for reference',
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

  static transform(doc: any): any {
    return BaseModel.transform(doc);
  }
}

const SpecSchema = SchemaFactory.createForClass(Spec);

SpecSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => Spec.transform(ret),
});
SpecSchema.post('find', (docs: any) => {
  if (!docs || docs.length === 0) {
    return docs;
  }
  return docs.map((doc: any) => Spec.transform(doc));
});
SpecSchema.post('findOne', (doc: any) => Spec.transform(doc));

export { SpecSchema };
