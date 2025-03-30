import { ApiProperty } from '@nestjs/swagger';
import { User } from '@root/models/user.model';

export class AuthenticatedResponseDto {
  @ApiProperty({
    description: 'Authorized user information',
    type: User,
  })
  user: User;

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
