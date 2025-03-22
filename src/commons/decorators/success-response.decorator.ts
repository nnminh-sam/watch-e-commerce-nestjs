import { applyDecorators, Type, UseInterceptors } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { GenericApiResponseDto } from '@root/commons/dtos/generic-api-response.dto';
import { PaginationResponseDto } from '@root/commons/dtos/pagination-response.dto';
import { ApiResponseWrapperInterceptor } from '@root/commons/interceptors/api-response-wrapper.interceptor';

/**
 * Payload for configuring a successful API response.
 * @template TModel The model type for the response data.
 */
export class SuccessApiResponsePayload<TModel extends Type<any>> {
  /** The model type to be used in the response */
  model?: TModel;

  /** The key under which the response data is stored */
  key?: string;

  /** A description of the API response */
  description: string;

  /** Specifies if the response contains an array of the model */
  isArray?: boolean;

  /** Specifies optional value for message key */
  messageKeyExample?: string;
}

/**
 * Decorator for defining a standardized successful API response.
 * @template TModel The model type for the response.
 * @param model The data model to be returned in the response.
 * @param key The key under which the response data is stored.
 * @param description A description of the response.
 * @param isArray Whether the response should be an array of the model.
 * @param messageKeyExample Optional example value of message key.
 */
export const SuccessApiResponse = <TModel extends Type<any>>({
  model,
  key,
  description,
  isArray = false,
  messageKeyExample,
}: SuccessApiResponsePayload<TModel>) => {
  const extraModels = [GenericApiResponseDto, PaginationResponseDto];
  if (model) extraModels.push(model);

  return applyDecorators(
    ApiExtraModels(...extraModels),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(GenericApiResponseDto) },
          {
            properties: {
              ...(model &&
                key && {
                  [key]: isArray
                    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
                    : { $ref: getSchemaPath(model) },
                }),
              ...(isArray && {
                pagination: {
                  $ref: getSchemaPath(PaginationResponseDto),
                },
              }),
              ...(messageKeyExample && {
                message: {
                  example: messageKeyExample,
                },
              }),
            },
          },
        ],
      },
    }),
    UseInterceptors(new ApiResponseWrapperInterceptor(key)),
  );
};
