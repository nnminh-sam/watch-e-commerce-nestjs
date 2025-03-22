import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';

export class PaginationOrderingDto {
  @ApiProperty({
    example: 1,
    description: 'Current page number',
    name: 'page',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    name: 'limit',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    example: 'name',
    description: 'Field to sort by',
    name: 'sort_by',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @ApiProperty({
    example: 'asc',
    enum: ['asc', 'desc'],
    description: 'Sorting order',
    name: 'order_by',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderBy?: 'asc' | 'desc' = 'asc';
}
