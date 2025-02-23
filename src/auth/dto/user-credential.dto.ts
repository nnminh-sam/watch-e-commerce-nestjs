import { Role } from '@root/user/entities/role.enum';

export class UserCredentialsDto {
  id: string;
  email: string;
  password: string;
  role: Role;
}
