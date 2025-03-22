import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Luxury Watches',
    description: 'Updated category name',
    name: 'name',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    example: 'Updated category description',
    description: 'Updated category description',
    name: 'description',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 'updated-luxury-watches',
    description: 'Updated category slug',
    name: 'slug',
  })
  @IsString()
  @IsOptional()
  slug: string;

  @ApiProperty({
    example: ['updated_image1.jpg', 'updated_image2.jpg'],
    description: 'Updated list of asset URLs',
    name: 'assets',
  })
  @IsString({ each: true })
  @IsOptional()
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
