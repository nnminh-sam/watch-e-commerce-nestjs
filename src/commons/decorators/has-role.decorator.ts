import { SetMetadata } from '@nestjs/common';
import { Role } from '@root/models/enums/role.enum';

export const ROLES_KEY = 'roles';
export const HasRoles = (roles: Role[] | Role) =>
  Array.isArray(roles)
    ? SetMetadata(ROLES_KEY, roles)
    : SetMetadata(ROLES_KEY, [roles]);
