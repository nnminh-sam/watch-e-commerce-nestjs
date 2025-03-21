import { RedisService } from '@root/database/redis.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';

@Injectable()
export class JwtManagerService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  checkTokenExpirationTime(exp: number) {
    const currentTimestamp: number = Math.floor(Date.now() / 1000);
    return currentTimestamp > exp;
  }

  decodeToken(token: string): TokenPayloadDto {
    return this.jwtService.decode(token) as TokenPayloadDto;
  }

  generateToken(payload: TokenPayloadDto, expiresIn: string) {
    return this.jwtService.sign({ ...payload, expiresIn });
  }

  async validateToken(token: string) {
    if (!token) return null;

    const claims: TokenPayloadDto = this.decodeToken(token);
    if (!claims || !claims?.exp) return null;

    const isExpiredToken: boolean = this.checkTokenExpirationTime(claims.exp);
    if (isExpiredToken) return null;

    const isBlackListedToken =
      await this.redisService.validateBlackListedToken(claims);
    if (isBlackListedToken) return null;

    const isNotResolveAfterChangePassword =
      await this.redisService.validateWithChangePasswordBlackListedToken(
        claims,
      );
    if (isNotResolveAfterChangePassword) return null;

    return claims;
  }
}
