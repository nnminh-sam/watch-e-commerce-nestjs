import { ApiProperty } from '@nestjs/swagger';
import { BaseRequestFilterDto } from '@root/commons/dtos/base-request-filter.dto';
import { IsOptional, IsString } from 'class-validator';

export class FindDeliveryAddressDto extends BaseRequestFilterDto {
  @ApiProperty({
    description: 'Search by recipient name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Search by phone number',
    example: '+84123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Search by city',
    example: 'Ho Chi Minh City',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Search by district',
    example: 'District 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({
    description: 'Search by street',
    example: 'Nguyen Hue Street',
    required: false,
  })
  @IsOptional()
  @IsString()
  street?: string;
}
