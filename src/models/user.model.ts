import {
  DeliveryInformation,
  DeliveryInformationSchema,
} from './delivery-information.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from '@root/models/enums/gender.enum';
import { Role } from '@root/models/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users', id: true })
export class User {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    name: 'email',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    example: 'hashedpassword',
    description: 'User password',
    name: 'password',
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    name: 'first_name',
  })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    name: 'last_name',
  })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({
    example: 'MALE',
    enum: Gender,
    description: 'User gender',
    name: 'gender',
  })
  @Prop({ required: true, default: Gender.OTHER })
  gender: Gender;

  @ApiProperty({
    example: '1990-01-01',
    description: 'User date of birth',
    name: 'date_of_birth',
  })
  @Prop({ required: true })
  dateOfBirth: Date;

  @ApiProperty({
    example: '+123456789',
    description: 'User phone number',
    name: 'phone_number',
  })
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @ApiProperty({
    example: 'CUSTOMER',
    enum: Role,
    description: 'User role',
    name: 'role',
  })
  @Prop({ required: true, default: Role.CUSTOMER })
  role: Role;

  @ApiProperty({
    description: 'User delivery addresses',
    name: 'delivery_address',
    type: [DeliveryInformation],
  })
  @Prop({
    type: [DeliveryInformationSchema],
    default: [],
  })
  deliveryAddress: DeliveryInformation[];

  @ApiProperty({
    example: true,
    description: 'User active status',
    name: 'is_active',
  })
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
