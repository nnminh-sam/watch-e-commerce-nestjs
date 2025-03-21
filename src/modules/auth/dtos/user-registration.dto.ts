import { Gender } from '@root/models/enums/gender.enum';
import { Role } from '@root/models/enums/role.enum';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class UserRegistrationDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsPhoneNumber('VN')
  phoneNumber: string;

  @IsDate()
  dateOfBirth: Date;

  @IsEnum(Role)
  role: Role;
}
