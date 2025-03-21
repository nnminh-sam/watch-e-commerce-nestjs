import { IsNotEmpty, IsString } from 'class-validator';

export class RevokeTokenPayload {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
