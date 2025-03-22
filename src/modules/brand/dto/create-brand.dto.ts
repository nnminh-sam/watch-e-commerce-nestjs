import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Rolex', description: 'The name of the brand' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'rolex',
    description: 'The unique slug for the brand',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug: string;

  @ApiProperty({
    example: 'Luxury watch brand',
    description: 'Description of the brand',
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: 'List of asset URLs',
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  assets: string[];
}
