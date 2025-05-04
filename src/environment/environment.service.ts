import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class EnvironmentService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get jwtSecret(): string {
    const result = this.configService.get<string>('JWT_SECRET');
    if (!result) {
      throw new Error('JWT Secret is required');
    }
    return result;
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '1h');
  }

  get refreshTokenExpiresIn(): string {
    return this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN', '1d');
  }

  get databaseUrl() {
    return this.configService.get<string>('DATABASE_URL');
  }

  get databaseHost() {
    return this.configService.get<string>('DATABASE_HOST');
  }

  get databasePort() {
    return this.configService.get<number>('DATABASE_PORT');
  }

  get databaseName() {
    return this.configService.get<string>('DATABASE_NAME');
  }

  get databaseUsername() {
    return this.configService.get<string>('DATABASE_USERNAME');
  }

  get databasePassword() {
    return this.configService.get<string>('DATABASE_PASSWORD');
  }

  get databaseDebug() {
    return this.configService.get<boolean>('DATABASE_DEBUG');
  }

  get redisHost(): string {
    const result = this.configService.get<string>('REDIS_HOST');
    if (!result) {
      throw new Error('Redis host is required');
    }
    return result;
  }

  get redisPort(): number {
    const result = this.configService.get<number>('REDIS_PORT');
    if (!result) {
      throw new Error('Redis port is required');
    }
    return result;
  }

  get redisUsername(): string {
    const result = this.configService.get<string>('REDIS_USERNAME');
    if (!result) {
      throw new Error('Redis username is required');
    }
    return result;
  }

  get redisPassword() {
    const result = this.configService.get<string>('REDIS_PASSWORD');
    if (!result) {
      throw new Error('Redis password is required');
    }
    return result;
  }

  get redisDbJwtBlacklist(): number {
    return this.configService.get<number>('REDIS_DB_JWT_BLACKLIST', 0);
  }

  get redisDbCart(): number {
    return this.configService.get<number>('REDIS_DB_CART', 1);
  }

  get redisDbRpc(): number {
    return this.configService.get<number>('REDIS_DB_RPC', 2);
  }

  get redisDbUploadMq(): number {
    return this.configService.get<number>('REDOS_DB_UPLOAD_MQ', 3);
  }

  get cloudinaryName() {
    const result = this.configService.get<string>('CLOUDINARY_NAME');
    if (!result) {
      throw new Error('Cloudinary name is required');
    }
    return result;
  }

  get cloudinaryApiKey() {
    const result = this.configService.get<string>('CLOUDINARY_API_KEY');
    if (!result) {
      throw new Error('Cloudinary API key is required');
    }
    return result;
  }

  get cloudinarySecret() {
    const result = this.configService.get<string>('CLOUDINARY_SECRET');
    if (!result) {
      throw new Error('Cloudinary secret is required');
    }
    return result;
  }

  get mailHost(): string {
    const result = this.configService.get<string>('MAIL_HOST');
    if (!result) {
      throw new Error('Mail host is required');
    }
    return result;
  }

  get mailPort(): number {
    const result = this.configService.get<number>('MAIL_PORT');
    if (!result) {
      throw new Error('Mail port is required');
    }
    return result;
  }

  get mailSecure(): boolean {
    const result = this.configService.get<number>('MAIL_SECURE');
    if (result === undefined) {
      throw new Error('Mail secure is required');
    }
    if (result == 1) {
      return true;
    }
    return false;
  }

  get mailUser(): string {
    const result = this.configService.get<string>('MAIL_USER');
    if (!result) {
      throw new Error('Mail user is required');
    }
    return result;
  }

  get mailPassword(): string {
    const result = this.configService.get<string>('MAIL_PASSWORD');
    if (!result) {
      throw new Error('Mail password is required');
    }
    return result;
  }

  get mailFrom(): string {
    const result = this.configService.get<string>('MAIL_FROM');
    if (!result) {
      throw new Error('Mail from is required');
    }
    return result;
  }
}
