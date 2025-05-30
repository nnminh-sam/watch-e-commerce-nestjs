import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@root/models/enums/product-status.enum';
import { Spec } from '@root/models/spec.model';

export class UpdateProductDto {
  @ApiProperty({
    example: 'Luxury Watch',
    description: 'Updated product name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Standard Product Unit',
  })
  @IsOptional()
  @IsString()
  spu?: string;

  @ApiProperty({
    example: 'LW12345-44MM-LEATHER',
    description: 'Stock Keeping Unit',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    example: 'A high-end luxury watch',
    description: 'Updated product description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Updated brand ID',
    name: 'brand_id',
  })
  @IsOptional()
  @IsMongoId()
  brandId?: string;

  @ApiProperty({
    example: ['60d21b4667d0d8992e610c86', '60d21b4667d0d8992e610c87'],
    description: 'Updated category IDs',
    name: 'category_ids',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    example: 80,
    description: 'Updated stock quantity',
  })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({
    example: 4500,
    description: 'Updated product price',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    example: 55,
    description: 'Updated number of units sold',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sold?: number;

  @ApiProperty({
    example: ['new_image1.jpg', 'new_image2.jpg'],
    description: 'Updated asset list',
    required: false,
  })
  @IsOptional()
  @IsArray()
  assets?: string[];

  @ApiProperty({
    description: 'Updated product specifications',
    type: [Spec],
    required: false,
  })
  @IsOptional()
  @IsArray()
  spec?: Spec[];

  @ApiProperty({
    example: ProductStatus.AVAILABLE,
    enum: ProductStatus,
    description: 'Updated product status',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({
    example: false,
    description: 'Updated customer visibility',
    name: 'customer_visible',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  customerVisible?: boolean;
}
