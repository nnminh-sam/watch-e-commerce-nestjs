import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AppConfigService } from '@root/app-config/app-config.service';
import { TokenPayloadDto } from '@root/auth/dto/token-payload.dto';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { RedisService } from 'src/databases/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.jwtSecret,
    });
  }

  async validate(payload: TokenPayloadDto) {
    // const isBlacklisted = await this.redisService.exists(
    //   `blacklist:${payload.jti}`,
    // );
    // if (isBlacklisted) {
    //   throw new UnauthorizedException('Token is blacklisted');
    // }
    console.log(`JWT: ${this.appConfigService.jwtSecret}`);
    return payload;
  }
}
