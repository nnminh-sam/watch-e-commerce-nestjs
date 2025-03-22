import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@root/models/enums/product-status.enum';
import { Spec } from '@root/models/spec.model';

export class UpdateProductDto {
  @ApiProperty({
    example: 'Luxury Watch',
    description: 'Updated product name',
    name: 'name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Updated product code',
    name: 'code',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    example: 'A high-end luxury watch',
    description: 'Updated product description',
    name: 'description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Updated brand ID',
    name: 'brand',
  })
  @IsMongoId()
  @IsString()
  brand: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c86',
    description: 'Updated category ID',
    name: 'category',
  })
  @IsMongoId()
  @IsString()
  category: string;

  @ApiProperty({
    example: 80,
    description: 'Updated stock quantity',
    name: 'stock',
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    example: 4500,
    description: 'Updated product price',
    name: 'price',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 55,
    description: 'Updated number of units sold',
    name: 'sold',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sold?: number;

  @ApiProperty({
    example: ['new_image1.jpg', 'new_image2.jpg'],
    description: 'Updated asset list',
    name: 'assets',
    required: false,
  })
  @IsArray()
  @IsOptional()
  assets?: string[];

  @ApiProperty({
    description: 'Updated product specifications',
    name: 'spec',
    required: false,
    type: [Spec],
  })
  @IsArray()
  @IsOptional()
  spec?: Spec[];

  @ApiProperty({
    example: ProductStatus.AVAILABLE,
    enum: ProductStatus,
    description: 'Updated product status',
    name: 'status',
    required: false,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({
    example: false,
    description: 'Updated customer visibility',
    name: 'customer_visible',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  customerVisible?: boolean;
}
