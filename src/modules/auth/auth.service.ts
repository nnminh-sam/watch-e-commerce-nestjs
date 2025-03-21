import { BlackListTokenMessage } from './../../models/enums/black-list-token-message.enum';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from '@root/database/redis.service';
import { EnvironmentService } from '@root/environment/environment.service';
import { SignOutResponseDto } from '@root/modules/auth/dtos/sign-out-response.dto';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { TokenResponseDto } from '@root/modules/auth/dtos/tokens-response.dto';
import { UpdatePasswordDto } from '@root/modules/auth/dtos/update-password.dto';
import { UserAuthenticationDto } from '@root/modules/auth/dtos/user-authentication.dto';
import { UserRegistrationDto } from '@root/modules/auth/dtos/user-registration.dto';
import { JwtManagerService } from '@root/modules/jwt-manager/jwt-manager.service';
import { UserService } from '@root/modules/user/user.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtManagerService: JwtManagerService,
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
  ) {}

  private generateTokens(tokenPayload: TokenPayloadDto): TokenResponseDto {
    const accessToken: string = this.jwtManagerService.generateToken(
      tokenPayload,
      this.environmentService.jwtExpiresIn || '1h',
    );
    const refreshToken: string = this.jwtManagerService.generateToken(
      tokenPayload,
      this.environmentService.refreshTokenExpiresIn || '1d',
    );
    return { accessToken, refreshToken };
  }

  async signIn({ email, password }: UserAuthenticationDto) {
    const user = await this.userService.validateUser(email, password);

    const tokenPayload: TokenPayloadDto = {
      jit: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      sub: user.id,
      email,
      role: user.role,
    };
    return this.generateTokens(tokenPayload);
  }

  async signUp(userRegistrationDto: UserRegistrationDto) {
    const user = await this.userService.create(userRegistrationDto);

    const tokenPayload: TokenPayloadDto = {
      jit: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.generateTokens(tokenPayload);
  }

  async signOut(token: string) {
    const claims = await this.jwtManagerService.validateToken(token);
    if (!claims) throw new BadRequestException('Invalid token');

    await this.redisService.invalidateTokenToBlackList(
      claims,
      BlackListTokenMessage.SIGNED_OUT,
    );

    return {
      message: 'User signed out',
      statusCode: 200,
      timestamp: new Date(),
    } as SignOutResponseDto;
  }

  private async revokeToken(token: string, tokenName: string = 'token') {
    const invalidTokenMessage = `Invalid ${tokenName}`;

    const claims = await this.jwtManagerService.validateToken(token);
    if (!claims) throw new BadRequestException(invalidTokenMessage);

    const isBlackListedToken =
      await this.redisService.validateBlackListedToken(claims);
    if (isBlackListedToken) throw new BadRequestException(invalidTokenMessage);

    const blackListedToken = await this.redisService.invalidateTokenToBlackList(
      claims,
      BlackListTokenMessage.REVOKED,
    );
    if (!blackListedToken)
      throw new BadRequestException('Cannot add token to black list');
  }

  async revokeTokens(
    claims: TokenPayloadDto,
    accessToken: string,
    refreshToken: string,
  ) {
    await Promise.all([
      this.revokeToken(accessToken),
      this.revokeToken(refreshToken),
    ]);

    const tokenPayload: TokenPayloadDto = {
      jit: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      sub: claims.sub,
      email: claims.email,
      role: claims.role,
    };
    return this.generateTokens(tokenPayload);
  }

  async changePassword(
    userId: string,
    { email, currentPassword, newPassword }: UpdatePasswordDto,
  ) {
    await this.userService.validateUser(email, currentPassword);

    const user = await this.userService.updatePassword(userId, newPassword);

    const jit = uuidv4();
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 10 * 24 * 60 * 60;
    await this.redisService.invalidateTokenToBlackList(
      {
        jit,
        iat,
        sub: user.id,
        email: user.email,
        role: user.role,
        exp,
      },
      BlackListTokenMessage.CHANGED_PASSWORD,
    );
  }
}
