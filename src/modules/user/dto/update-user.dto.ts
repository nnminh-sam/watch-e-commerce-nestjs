import { Gender } from '@root/models/enums/gender.enum';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'Updated first name',
    name: 'first_name',
  })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Updated last name',
    name: 'last_name',
  })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({
    example: 'MALE',
    enum: Gender,
    description: 'Updated gender',
    name: 'gender',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Updated date of birth',
    name: 'date_of_birth',
  })
  @IsDate()
  @IsOptional()
  dateOfBirth: Date;

  @ApiProperty({
    example: '+123456789',
    description: 'Updated phone number',
    name: 'phone_number',
  })
  @IsString()
  @IsOptional()
  phoneNumber: string;
}
