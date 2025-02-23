import { Reflector } from '@nestjs/core';
import { Role } from '@root/user/entities/role.enum';

export const HasRoles = Reflector.createDecorator<[Role]>();
