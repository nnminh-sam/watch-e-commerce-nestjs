import { ApiProperty } from '@nestjs/swagger';
import { BaseRequestFilterDto } from '@root/commons/dtos/base-request-filter.dto';
import { IsOptional, IsString } from 'class-validator';

export class FindBrandDto extends BaseRequestFilterDto {
  @ApiProperty({
    description: 'Finding brand name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
