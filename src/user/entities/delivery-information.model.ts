import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class DeliveryInformation {
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
