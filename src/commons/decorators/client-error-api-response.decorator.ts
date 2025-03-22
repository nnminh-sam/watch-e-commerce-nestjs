import { applyDecorators } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { GenericApiResponseDto } from '@root/commons/dtos/generic-api-response.dto';

/**
 * Payload for configuring a client error API response.
 */
export class ClientErrorApiResponsePayload {
  /** The HTTP status code for the error response */
  status: number;

  /** A description of the error response */
  description: string;
}

/**
 * Decorator for defining a standardized client error API response.
 * @param status The HTTP status code for the response.
 * @param description A description of the error response.
 */
export const ClientErrorApiResponse = ({
  status,
  description,
}: ClientErrorApiResponsePayload) => {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(GenericApiResponseDto) },
          {
            properties: {
              message: {
                type: 'string',
                example: 'This is an unsuccessful request',
              },
              status: { example: 'error' },
              errors: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                },
                description: 'API response errors',
              },
            },
          },
        ],
      },
    }),
  );
};
