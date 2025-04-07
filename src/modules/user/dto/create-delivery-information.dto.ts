import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryInformationDto {
  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'John Doe',
    name: 'full_name',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Phone number of the recipient',
    example: '+84123456789',
    name: 'phone_number',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'City of the recipient',
    example: 'Ho Chi Minh City',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'District of the recipient',
    example: 'District 1',
  })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({
    description: 'Street of the recipient',
    example: 'Nguyen Hue Street',
  })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({
    description:
      'Specific address details such as house number, floor, apartment',
    example: '123A, Floor 3, Sunrise City Apartment',
    name: 'specific_address',
  })
  @IsNotEmpty()
  @IsString()
  specificAddress: string;
}
