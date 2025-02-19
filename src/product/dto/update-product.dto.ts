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
import { ProductStatus } from '@root/product/entities/product-status.enum';
import { Spec } from '@root/product/entities/spec.model';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsString()
  brand: string;

  @IsMongoId()
  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sold?: number;

  @IsArray()
  @IsOptional()
  assets?: string[];

  @IsArray()
  @IsOptional()
  spec?: Spec[];

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsBoolean()
  @IsOptional()
  customerVisible?: boolean;
}
