import { ApiProperty } from '@nestjs/swagger';
import { BaseRequesetFilterDto } from '@root/commons/dtos/base-request-filter.dto';
import { IsOptional, IsString } from 'class-validator';

export class FindBrandDto extends BaseRequesetFilterDto {
  @ApiProperty({
    description: 'Finding brand name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
