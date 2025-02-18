import { DeliveryInformation } from './delivery-information.model';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender } from '@root/user/entities/gender.enum';
import { Role } from '@root/user/entities/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
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

  @Prop()
  deliveryAddress: DeliveryInformation[];

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const UserCollection: string = 'users';
export const UserModelRegistration = MongooseModule.forFeature([
  {
    name: UserCollection,
    schema: UserSchema,
  },
]);
