import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsString({ each: true })
  @IsOptional()
  assets: string[];

  @IsBoolean()
  @IsOptional()
  isFeatured: boolean;
}
