import { Gender } from '@root/models/enums/gender.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'Updated first name',
    name: 'first_name',
  })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Updated last name',
    name: 'last_name',
  })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'MALE',
    enum: Gender,
    description: 'Updated gender',
    name: 'gender',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Updated date of birth',
    name: 'date_of_birth',
  })
  @IsOptional()
  dateOfBirth: Date;

  @ApiProperty({
    example: '+123456789',
    description: 'Updated phone number',
    name: 'phone_number',
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;
}
