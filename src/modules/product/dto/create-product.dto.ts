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

export class CreateProductDto {
  @ApiProperty({
    example: 'Luxury Watch',
    description: 'Product name',
    name: 'name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Product code',
    name: 'code',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'A high-end luxury watch',
    description: 'Product description',
    name: 'description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 4999.99,
    description: 'Product price',
    name: 'price',
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Brand ID',
    name: 'brand',
  })
  @IsMongoId()
  @IsString()
  brand: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c86',
    description: 'Category ID',
    name: 'category',
  })
  @IsMongoId()
  @IsString()
  category: string;

  @ApiProperty({ example: 100, description: 'Available stock', name: 'stock' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    example: 50,
    description: 'Number of units sold',
    name: 'sold',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sold?: number;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of asset URLs',
    name: 'assets',
    required: false,
  })
  @IsArray()
  @IsOptional()
  assets?: string[];

  @ApiProperty({
    description: 'Product specifications',
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
    description: 'Product status',
    name: 'status',
    required: false,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({
    example: true,
    description: 'Is product visible to customers',
    name: 'customer_visible',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  customerVisible?: boolean;
}
