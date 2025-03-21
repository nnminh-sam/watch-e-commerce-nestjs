import { Gender } from '@root/models/enums/gender.enum';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @IsDate()
  @IsOptional()
  dateOfBirth: Date;

  @IsString()
  @IsOptional()
  phoneNumber: string;
}
