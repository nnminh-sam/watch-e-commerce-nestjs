import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '@root/commons/dtos/pagination-response.dto';

export class GenericApiResponseDto<T> {
  @ApiProperty({
    example: '2002-12-10T12:00:00.000Z',
    description: 'Response timestamp',
  })
  timestamp: Date;

  @ApiProperty({
    example: '/api/v1/customer',
    description: 'Request path',
  })
  path: string;

  @ApiProperty({
    example: 'success',
    description: 'API response result',
  })
  status: 'success' | 'error';

  @ApiProperty({
    example: 'This is an example message',
    description: 'API response message',
  })
  message: string;

  data?: T;

  pagination?: PaginationResponseDto;

  errors?: Record<string, string>[];

  count?: number;

  constructor(data: T, pagination?: PaginationResponseDto) {
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
    this.path = '';
    this.timestamp = new Date();
    this.message = '';
    this.status = 'success';
  }
}
