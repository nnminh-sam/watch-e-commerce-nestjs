import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Luxury Watches',
    description: 'Updated category name',
    name: 'name',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Updated category description',
    description: 'Updated category description',
    name: 'description',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'updated-luxury-watches',
    description: 'Updated category slug',
    name: 'slug',
  })
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty({
    example: ['updated_image1.jpg', 'updated_image2.jpg'],
    description: 'Updated list of asset URLs',
    name: 'assets',
  })
  @IsOptional()
  @IsArray()
  assets: string[];

  @ApiProperty({
    example: false,
    description: 'Updated featured status',
    name: 'is_featured',
  })
  @IsOptional()
  @IsBoolean()
  isFeatured: boolean;
}
