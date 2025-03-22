import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevokeTokenPayload {
  @ApiProperty({
    example: 'your-refresh-token',
    description: 'The refresh token to be revoked',
    name: 'refresh_token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
