import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    example: 'access-token-example',
    description: 'JWT Access Token',
    name: 'access_token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'refresh-token-example',
    description: 'JWT Refresh Token',
    name: 'refresh_token',
  })
  refreshToken: string;
}
