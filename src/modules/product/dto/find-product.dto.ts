import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseRequestFilterDto } from '@root/commons/dtos/base-request-filter.dto';
import { Transform } from 'class-transformer';

export class FindProductDto extends BaseRequestFilterDto {
  @ApiProperty({
    example: 'Luxury Watch',
    description: 'Search for products contain this name',
    name: 'name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Search for products contain this SPU',
    required: false,
  })
  @IsOptional()
  @IsString()
  spu?: string;

  @ApiProperty({
    example: 'LW12345-44MM-LEATHER',
    description: 'Search for products contain this SKU',
    required: false,
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    example: 1000,
    description: 'Minimum price filter',
    name: 'min_price',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: any) => parseInt(value))
  @IsNumber({}, { message: 'Min price must be a number' })
  @IsPositive({ message: 'Min price must be a positive number' })
  minPrice?: number;

  @ApiProperty({
    example: 5000,
    description: 'Maximum price filter',
    name: 'max_price',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: any) => parseInt(value))
  @IsNumber({}, { message: 'Max price must be a number' })
  @IsPositive({ message: 'Max price must be a positive number' })
  maxPrice?: number;

  @ApiProperty({
    example: 'Casi',
    description: 'Search for products contain this brand name',
    name: 'brand',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Brand ID filter',
    name: 'brand_id',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid brand ID' })
  brandId: string;

  @ApiProperty({
    example: 'luxu',
    description: 'Search for products contain this category name',
    name: 'category',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c86',
    description: 'Category ID filter',
    name: 'category_id',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid category ID' })
  categoryId?: string;

  @ApiProperty({
    example: [
      '60d21b4667d0d8992e610c86',
      '60d21b4667d0d8992e610c86',
      '60d21b4667d0d8992e610c86',
    ],
    description: 'Product specification ID list filter',
    name: 'spec_ids',
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  specIds: string[];
}
