import { Role } from '@root/models/enums/role.enum';

export class TokenPayloadDto {
  jit: string;
  exp?: number;
  iat: number;
  sub: string;
  email: string;
  role: Role;
}
