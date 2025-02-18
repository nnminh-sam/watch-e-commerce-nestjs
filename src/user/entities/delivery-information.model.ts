import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DeliveryInformationDocument = DeliveryInformation & Document;

@Schema({
  timestamps: true,
  collection: 'delivery-information',
  id: true,
})
export class DeliveryInformation {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  id: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  specificAddress: string;

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
