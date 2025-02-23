import { Role } from '@root/user/entities/role.enum';

export class TokenPayloadDto {
  jti: string;
  sub: string;
  email: string;
  role: Role;
  exp?: number;
}
