import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
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

  @IsOptional()
  @IsBoolean()
  isFeatured: boolean;
}
