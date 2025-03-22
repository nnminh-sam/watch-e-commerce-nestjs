import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto {
  @ApiProperty({
    description: 'Number of returned items',
    example: '5',
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: '1',
  })
  page: number;

  @ApiProperty({
    description: 'Maximum number of items per page',
    example: '10',
  })
  perPage: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: '1',
  })
  totalPages: number;
}
