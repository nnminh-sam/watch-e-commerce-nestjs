import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { RedisService } from '@root/database/redis.service';
import { EnvironmentService } from '@root/environment/environment.service';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { JwtManagerService } from '@root/modules/jwt-manager/jwt-manager.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly EnvironmentService: EnvironmentService,
    private readonly jwtManagerService: JwtManagerService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: EnvironmentService.jwtSecret as string,
    });
  }

  async validate(payload: TokenPayloadDto) {
    if (!payload?.exp) throw new BadRequestException('Invalid token');

    const isExpiredToken: boolean =
      this.jwtManagerService.checkTokenExpirationTime(payload.exp);
    if (isExpiredToken) throw new BadRequestException('Invalid token');

    const isBlackListedToken =
      await this.redisService.validateBlackListedToken(payload);
    if (isBlackListedToken) throw new BadRequestException('Invalid token');

    return payload;
  }
}
