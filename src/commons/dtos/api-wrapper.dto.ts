import { ApiProperty } from '@nestjs/swagger';

export class ApiWrapperDto<T> {
  @ApiProperty({
    example: '2002-12-10T12:00:00.000Z',
    description: 'Response timestamp',
  })
  timestamp: Date;

  @ApiProperty({ example: '/api/auth/sign-in', description: 'Request path' })
  path: string;

  @ApiProperty({
    example: '200',
    description: 'Response status code',
    name: 'status_code',
  })
  statusCode: number;

  data: T;
}
