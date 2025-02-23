import { Role } from '@root/user/entities/role.enum';

export class TokenPayloadDto {
  // * JWT ID: This ensure the generated token is unique for token blacklisting and revocation.
  jti: string;
  sub: string;
  email: string;
  role: Role;
  exp?: number;
}
