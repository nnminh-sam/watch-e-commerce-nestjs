import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @ApiProperty({
    example: 'Rolex',
    description: 'Updated name of the brand',
    required: false,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'rolex',
    description: 'Updated unique slug for the brand',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'Updated luxury watch brand description',
    description: 'Updated description of the brand',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: ['new_image1.jpg', 'new_image2.jpg'],
    description: 'Updated list of asset URLs',
    required: false,
  })
  @IsOptional()
  @IsString()
  assets: string[];
}
