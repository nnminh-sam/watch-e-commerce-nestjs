import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Luxury Watches',
    description: 'Category name',
    name: 'name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'High-end luxury watches',
    description: 'Category description',
    name: 'description',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'luxury-watches',
    description: 'Category slug',
    name: 'slug',
  })
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of asset URLs',
    name: 'assets',
  })
  @IsOptional()
  @IsString()
  assets: string[];

  @ApiProperty({
    example: true,
    description: 'Indicates if the category is featured',
    name: 'is_featured',
  })
  @IsOptional()
  @IsBoolean()
  isFeatured: boolean;
}
