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
import { ProductStatus } from '@root/models/enums/product-status.enum';
import { Spec } from '@root/models/spec.model';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

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
