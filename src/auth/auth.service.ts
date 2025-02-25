import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RevokeTokenPayload } from '@root/auth/dto/revoke-token-payload.dto';
import { SignOutResponseDto } from '@root/auth/dto/sign-out-response.dto';
import { TokenPayloadDto } from '@root/auth/dto/token-payload.dto';
import { TokenResponseDto } from '@root/auth/dto/tokens-response.dto';
import { UserAuthenticationDto } from '@root/auth/dto/user-authentication.dto';
import { UserRegistrationDto } from '@root/auth/dto/user-registration.dto';
import { RedisService } from '@root/database/redis.service';
import { UserService } from '@root/user/user.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private isTokenExpired(exp: number) {
    const currentTime: number = Math.floor(Date.now() / 1000);
    return currentTime > exp;
  }

  private validatePassword(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword);
  }

  private getClaims(token: string) {
    return this.jwtService.decode(token) as TokenPayloadDto;
  }

  private generateTokens(tokenPayload: TokenPayloadDto): TokenResponseDto {
    const accessToken: string = this.jwtService.sign({
      ...tokenPayload,
      expiresIn: '1h',
    });
    const refreshToken: string = this.jwtService.sign({
      ...tokenPayload,
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async validateToken(token: string) {
    const claims = this.getClaims(token);
    if (!claims?.exp) {
      throw new BadRequestException('Invalid token');
    }

    const isTokenBlacklisted = await this.redisService.isTokenBlacklisted(
      claims.jti,
    );
    if (isTokenBlacklisted) {
      throw new BadRequestException('Invalid token');
    }

    if (this.isTokenExpired(claims.exp)) {
      throw new BadRequestException('Invalid token');
    }
    return true;
  }

  async validateUser({ email, password }: UserAuthenticationDto) {
    const credentials = await this.userService.getUserCredentialsByEmail(email);
    const isValidPassword = await this.validatePassword(
      password,
      credentials.password,
    );
    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }
    return credentials;
  }

  async signIn(userAuthenticationDto: UserAuthenticationDto) {
    const validatedUserCredential = await this.validateUser(
      userAuthenticationDto,
    );

    const tokenPayload: TokenPayloadDto = {
      jti: uuid(),
      sub: validatedUserCredential.id,
      email: validatedUserCredential.email,
      role: validatedUserCredential.role,
    };
    return this.generateTokens(tokenPayload);
  }

  async signUp(userRegistrationDto: UserRegistrationDto) {
    const user = await this.userService.create(userRegistrationDto);
    const tokenPayload: TokenPayloadDto = {
      jti: uuid(),
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.generateTokens(tokenPayload);
  }

  async signOut(token: string) {
    const isValidToken = await this.validateToken(token);
    if (!isValidToken) {
      throw new BadRequestException('Invalid token');
    }

    const claims: TokenPayloadDto = await this.jwtService.decode(token);
    if (!claims?.exp) {
      throw new BadRequestException('Invalid token');
    }

    // * Add 10 seconds to the token's expiration time to make sure it is blacklisted
    const blackListTtl: number =
      claims.exp - Math.floor(Date.now() / 1000) + 10;
    await this.redisService.setTokenToBlackList(claims.jti, blackListTtl);

    return {
      message: 'User signed out',
      statusCode: 200,
      timestamp: new Date(),
    } as SignOutResponseDto;
  }

  async revokeTokens(accessToken: string, refreshToken: string) {
    const accessTokenClams = this.getClaims(accessToken);
    if (!accessTokenClams?.exp) {
      throw new BadRequestException('Invalid token');
    }

    if (this.isTokenExpired(accessTokenClams.exp)) {
      throw new BadRequestException('Invalid token');
    }

    const claims = this.getClaims(refreshToken);
    if (!claims?.exp) {
      throw new BadRequestException('Invalid refresh token');
    }

    if (this.isTokenExpired(claims.exp)) {
      throw new BadRequestException('Invalid refresh token');
    }

    const blackListAccessTokenTtl: number =
      claims.exp - Math.floor(Date.now() / 1000) + 10;
    await this.redisService.setTokenToBlackList(
      accessTokenClams.jti,
      blackListAccessTokenTtl,
    );

    const tokenPayload: TokenPayloadDto = {
      jti: uuid(),
      sub: claims.sub,
      email: claims.email,
      role: claims.role,
    };
    return this.generateTokens(tokenPayload);
  }
}
