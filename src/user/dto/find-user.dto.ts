import { Gender } from '@root/user/entities/gender.enum';
import { Role } from '@root/user/entities/role.enum';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class FindUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
