import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

class EnvironmentVariable {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.DEVELOPMENT;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  DATABASE_HOST?: string;

  @IsNumber()
  @IsOptional()
  DATABASE_PORT?: number;

  @IsString()
  @IsOptional()
  DATABASE_NAME?: string;

  @IsString()
  @IsOptional()
  DATABASE_USERNAME?: string;

  @IsString()
  @IsOptional()
  DATABASE_PASSWORD?: string;
}

export function validate(
  config: Record<string, number | string | Environment>,
): EnvironmentVariable {
  const validatedVariables = plainToInstance(EnvironmentVariable, config, {
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
