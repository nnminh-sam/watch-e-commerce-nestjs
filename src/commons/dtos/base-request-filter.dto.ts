import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';

export class BaseRequesetFilterDto {
  @ApiProperty({
    example: 1,
    description: 'Current page number',
    name: 'page',
    required: false,
  })
  @IsOptional()
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    name: 'limit',
    required: false,
  })
  @IsOptional()
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiProperty({
    example: 'name',
    description: 'Field to sort by',
    name: 'sort_by',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy: string = '_id';

  @ApiProperty({
    example: 'asc',
    enum: ['asc', 'desc'],
    description: 'Sorting order',
    name: 'order_by',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderBy: 'asc' | 'desc' = 'asc';
}
