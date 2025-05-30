import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@root/models/enums/product-status.enum';
import { Spec } from '@root/models/spec.model';

export class CreateProductDto {
  @ApiProperty({
    example: 'Luxury Watch',
    description: 'Product name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'LW12345',
    description: 'Standard Product Unit',
  })
  @IsNotEmpty()
  @IsString()
  spu: string;

  @ApiProperty({
    example: 'LW12345-44MM-LEATHER',
    description: 'Stock Keeping Unit',
  })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({
    example: 'A high-end luxury watch',
    description: 'Product description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 4999.99,
    description: 'Product price',
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'Brand ID',
    name: 'brand_id',
  })
  @IsNotEmpty()
  @IsMongoId()
  brandId: string;

  @ApiProperty({
    example: ['60d21b4667d0d8992e610c86', '60d21b4667d0d8992e610c87'],
    description: 'Category IDs',
    name: 'category_ids',
  })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds: string[];

  @ApiProperty({ example: 100, description: 'Available stock', name: 'stock' })
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @ApiProperty({
    example: 50,
    description: 'Number of units sold',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sold?: number;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of asset URLs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  assets?: string[];

  @ApiProperty({
    description: 'Product specifications',
    required: false,
    type: [Spec],
  })
  @IsOptional()
  @IsArray()
  specs?: Spec[];

  @ApiProperty({
    example: ProductStatus.AVAILABLE,
    enum: ProductStatus,
    description: 'Product status',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({
    example: true,
    description: 'Is product visible to customers',
    name: 'customer_visible',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  customerVisible?: boolean;
}
