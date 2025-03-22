import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DeliveryInformationDocument = DeliveryInformation & Document;

@Schema({
  timestamps: true,
  collection: 'delivery-information',
  id: true,
})
export class DeliveryInformation {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Delivery information ID',
    name: 'id',
  })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the recipient',
    name: 'full_name',
  })
  @Prop({ required: true })
  fullName: string;

  @ApiProperty({
    example: '+123456789',
    description: 'Phone number of the recipient',
    name: 'phone_number',
  })
  @Prop({ required: true })
  phoneNumber: string;

  @ApiProperty({ example: 'New York', description: 'City name', name: 'city' })
  @Prop({ required: true })
  city: string;

  @ApiProperty({
    example: 'Manhattan',
    description: 'District name',
    name: 'district',
  })
  @Prop({ required: true })
  district: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Street name',
    name: 'street',
  })
  @Prop({ required: true })
  street: string;

  @ApiProperty({
    example: 'Apt 4B',
    description: 'Specific address details',
    name: 'specific_address',
  })
  @Prop({ required: true })
  specificAddress: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if this is the default delivery address',
    name: 'is_default',
  })
  @Prop({ default: false })
  isDefault: boolean;
}

const DeliveryInformationSchema =
  SchemaFactory.createForClass(DeliveryInformation);

DeliveryInformationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { DeliveryInformationSchema };
