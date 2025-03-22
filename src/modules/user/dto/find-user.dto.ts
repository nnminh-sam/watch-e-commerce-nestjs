import { Gender } from '@root/models/enums/gender.enum';
import { Role } from '@root/models/enums/role.enum';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOrderingDto } from '@root/commons/dtos/pagination-ordering.dto';

export class FindUserDto extends PaginationOrderingDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    name: 'name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    name: 'first_name',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    name: 'last_name',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    name: 'email',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'MALE',
    enum: Gender,
    description: 'User gender',
    name: 'gender',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    example: '1990-01-01',
    description: 'User date of birth (YYYY-MM-DD)',
    name: 'date_of_birth',
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dateOfBirth?: Date;

  @ApiProperty({
    example: '+123456789',
    description: 'User phone number',
    name: 'phone_number',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: 'CUSTOMER',
    enum: Role,
    description: 'User role',
    name: 'role',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
