import { applyDecorators, Type, UseInterceptors } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiWrapperDto } from '@root/commons/dtos/api-wrapper.dto';
import { ApiResponseWrapperInterceptor } from '@root/commons/interceptors/api-response-wrapper.interceptor';

/**
 * A custom decorator for wrapping API responses in a standardized format.
 *
 * This decorator automatically applies Swagger documentation and an interceptor
 * to ensure that the response follows a consistent structure.
 *
 * The final response structure will be:
 *
 * ```json
 * {
 *   "timestamp": "2024-03-22T12:00:00.000Z",
 *   "path": "/api/endpoint",
 *   "customKey": { ...responseData }
 * }
 * ```
 *
 * @template TModel - The response DTO class.
 * @param {TModel} model - The DTO class representing the response data.
 * @param {string} [key='data'] - The custom key under which the response data will be nested.
 *
 * @example
 * ```typescript
 * @ApiResponseWrapper(UserDto, 'user')
 * @Get('profile')
 * async getProfile() {
 *   return await this.userService.getProfile();
 * }
 * ```
 */
export const ApiResponseWrapper = <
  TModel extends Type<any> | StringConstructor,
>(
  model: TModel,
  key: string = 'data',
  description: string = 'Success',
) => {
  return applyDecorators(
    ApiExtraModels(ApiWrapperDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiWrapperDto) },
          {
            properties: {
              [key]:
                model === String
                  ? { type: 'string', example: 'Success' }
                  : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
    UseInterceptors(new ApiResponseWrapperInterceptor(key)),
  );
};
