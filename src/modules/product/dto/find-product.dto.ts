import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindProductDto {
  @ApiProperty({
    example: 'Luxury Watch',
    description: 'Product name',
    name: 'name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Product code',
    name: 'code',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    example: 1000,
    description: 'Minimum price filter',
    name: 'min_price',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiProperty({
    example: 5000,
    description: 'Maximum price filter',
    name: 'max_price',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Brand ID filter',
    name: 'brand',
    required: false,
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c86',
    description: 'Category ID filter',
    name: 'category',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;
}
