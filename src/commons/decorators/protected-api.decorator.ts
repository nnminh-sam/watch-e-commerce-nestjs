import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@root/models/enums/role.enum';

export class ProtectedApiPayload {
  summary: string;
  description?: string;
  roles?: Role[];
}

// * Decorator for protecting API endpoints [Decorator Pattern]
export const ProtectedApi = ({
  summary,
  description,
  roles,
}: ProtectedApiPayload) => {
  const requiredRoles =
    roles?.length === 0
      ? ''
      : roles
          ?.map((role: Role) => {
            return `${role}`;
          })
          .join(', ');
  const result: string = requiredRoles
    ? `Allowed user roles: [${requiredRoles}] - ${summary}`
    : summary;
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: result,
      description,
    }),
  );
};
