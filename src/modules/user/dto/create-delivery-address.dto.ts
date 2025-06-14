import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryAddressDto {
  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Phone number of the recipient',
    example: '+84123456789',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'City name',
    example: 'Ho Chi Minh City',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'District name',
    example: 'District 1',
  })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({
    description: 'Street name',
    example: 'Nguyen Hue Street',
  })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({
    description: 'Specific address details',
    example: '123A, Floor 3, Sunrise City Apartment',
  })
  @IsNotEmpty()
  @IsString()
  specificAddress: string;

  @ApiProperty({
    description: 'Set as default address',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
