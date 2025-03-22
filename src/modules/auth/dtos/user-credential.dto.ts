import { Role } from '@root/models/enums/role.enum';

export class UserCredentialsDto {
  id: string;
  email: string;
  role: Role;
}
