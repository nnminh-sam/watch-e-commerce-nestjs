import { IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString({ each: true })
  @IsOptional()
  assets: string[];
}
