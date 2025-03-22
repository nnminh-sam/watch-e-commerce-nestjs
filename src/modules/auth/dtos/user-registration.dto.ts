import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    name: 'first_name',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    name: 'last_name',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  lastName: string;

  @ApiProperty({
    example: Gender.MALE,
    enum: Gender,
    description: 'User gender',
  })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: '+84901234567',
    description: 'User phone number',
    name: 'phone_number',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: '1995-08-15',
    description: 'User date of birth (YYYY-MM-DD)',
    name: 'date_of_birth',
  })
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({ example: Role.CUSTOMER, enum: Role, description: 'User role' })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
