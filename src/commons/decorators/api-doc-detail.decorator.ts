import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiDocDto } from '@root/commons/dtos/api-doc.dto';

export const ApiDocDetail = (payload: ApiDocDto) => {
  const decorators = [];

  if (payload.summary) {
    decorators.push(ApiOperation({ summary: payload.summary }));
  }

  if (payload?.wraperObjectSchema) {
    decorators.push(
      ApiResponse({
        status: 200,
        description: payload.okResponseDescription || 'Success',
        schema: {
          $ref: getSchemaPath(payload.wraperObjectSchema),
        },
      }),
    );
  }

  if (payload?.unauthorizedResponseDescription) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: payload.unauthorizedResponseDescription,
      }),
    );
  }

  if (payload?.badRequestResponseDescription) {
    decorators.push(
      ApiBadRequestResponse({
        description: payload.badRequestResponseDescription || 'Unauthorized',
      }),
    );
  }

  return applyDecorators(...decorators);
};
