import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AppConfigService } from '@root/app-config/app-config.service';
import { TokenPayloadDto } from '@root/auth/dto/token-payload.dto';
import { RedisService } from '@root/database/redis.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.jwtSecret,
    });
  }

  async validate(payload: TokenPayloadDto) {
    const isTokenBlacklisted = await this.redisService.isTokenBlacklisted(
      payload.jti,
    );
    if (isTokenBlacklisted) {
      throw new UnauthorizedException('Unauthorized');
    }
    return payload;
  }
}
