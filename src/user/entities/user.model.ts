import {
  DeliveryInformation,
  DeliveryInformationSchema,
} from './delivery-information.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from '@root/user/entities/gender.enum';
import { Role } from '@root/user/entities/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users', id: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, default: Gender.OTHER })
  gender: Gender;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, default: Role.CUSTOMER })
  role: Role;

  @Prop({
    type: [DeliveryInformationSchema],
    default: [],
  })
  deliveryAddress: DeliveryInformation[];

  @Prop({ default: true })
  isActive: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({
  firstName: 'text',
  lastName: 'text',
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

export { UserSchema };
