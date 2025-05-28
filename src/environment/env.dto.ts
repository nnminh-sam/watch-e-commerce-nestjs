import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentModel {
  @IsNumber()
  PORT: number;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  REFRESH_TOKEN_EXPIRES_IN: string;

  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @IsOptional()
  @IsString()
  DATABASE_HOST?: string;

  @IsOptional()
  @IsNumber()
  DATABASE_PORT?: number;

  @IsOptional()
  @IsString()
  DATABASE_NAME?: string;

  @IsOptional()
  @IsString()
  DATABASE_USERNAME?: string;

  @IsOptional()
  @IsString()
  DATABASE_PASSWORD?: string;

  @IsOptional()
  @IsBoolean()
  DATABASE_DEBUG?: boolean = false;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  REDIS_USERNAME: string;

  @IsString()
  REDIS_PASSWORD: string;

  @IsNumber()
  REDIS_DB_JWT_BLACKLIST: number;

  @IsNumber()
  REDIS_DB_CART: number;

  @IsNumber()
  REDIS_DB_RPC: number;

  @IsNumber()
  REDOS_DB_UPLOAD_MQ: number;

  @IsString()
  CLOUDINARY_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_SECRET: string;

  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  MAIL_PORT: number;

  @IsNumber()
  MAIL_SECURE: number;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASSWORD: string;

  @IsString()
  MAIL_FROM: string;
}

export function validate(
  config: Record<string, number | string>,
): EnvironmentModel {
  const validatedVariables = plainToInstance(EnvironmentModel, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedVariables, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedVariables;
}
