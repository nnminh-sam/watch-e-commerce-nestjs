import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get jwtSecret(): string {
    const data = this.configService.get<string>('JWT_SECRET');
    if (data) {
      return data;
    } else {
      throw new Error('JWT_SECRET is not defined');
    }
  }

  get databaseUrl(): string {
    const data = this.configService.get<string>('DATABASE_URL');
    if (data) {
      return data;
    } else {
      throw new Error('DATABASE_URL is not defined');
    }
  }

  get databaseHost(): string {
    const data = this.configService.get<string>('DATABASE_HOST');
    if (data) {
      return data;
    } else {
      throw new Error('DATABASE_HOST is not defined');
    }
  }

  get databasePort(): number {
    const data = this.configService.get<number>('DATABASE_PORT');
    if (data) {
      return data;
    } else {
      throw new Error('DATABASE_PORT is not defined');
    }
  }

  get databaseName(): string {
    const data = this.configService.get<string>('DATABASE_NAME');
    if (data) {
      return data;
    } else {
      throw new Error('DATABASE_NAME is not defined');
    }
  }

  get databaseUsername(): string {
    const data = this.configService.get<string>('DATABASE_USERNAME');
    if (data) {
      return data;
    } else {
      throw new Error('DATABASE_USERNAME is not defined');
    }
  }

  get databasePassword(): string {
    const data = this.configService.get<string>('DATABASE_PASSWORD');
    if (data) {
      return data;
    } else {
      throw new Error('DATABASE_PASSWORD is not defined');
    }
  }
}
