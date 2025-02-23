import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from '@root/auth/dto/token-payload.dto';
import { UserAuthenticationDto } from '@root/auth/dto/user-authentication.dto';
import { UserRegistrationDto } from '@root/auth/dto/user-registration.dto';
import { UserService } from '@root/user/user.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private isTokenExpired(exp: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime > exp;
  }

  private async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compareSync(password, hashedPassword);
  }

  async generateTokens(tokenPayload: TokenPayloadDto) {
    const accessToken = this.jwtService.sign({
      ...tokenPayload,
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign({
      ...tokenPayload,
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async validateToken(token: string) {
    const decodedToken: TokenPayloadDto = this.jwtService.decode(token);
    if (!decodedToken?.exp || this.isTokenExpired(decodedToken.exp)) {
      throw new BadRequestException('Invalid token');
    }
    return true;
  }

  async validateUser({ email, password }: UserAuthenticationDto) {
    const credentials = await this.userService.getUserCredentialsByEmail(email);
    const isValidPassword = await this.comparePasswords(
      password,
      credentials.password,
    );
    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }
    return credentials;
  }

  async login(userAuthenticationDto: UserAuthenticationDto) {
    const validatedUserCredential = await this.validateUser(
      userAuthenticationDto,
    );

    const tokenPayload: TokenPayloadDto = {
      jti: uuid(),
      sub: validatedUserCredential.id,
      email: validatedUserCredential.email,
      role: validatedUserCredential.role,
    };
    return await this.generateTokens(tokenPayload);
  }

  async signUp(userRegistrationDto: UserRegistrationDto) {
    const user = await this.userService.create(userRegistrationDto);
    const tokenPayload: TokenPayloadDto = {
      jti: uuid(),
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return await this.generateTokens(tokenPayload);
  }

  // async logout(token: string, ttl: number) {
  //   const clamis = this.jwtService.decode(token) as TokenPayloadDto;
  //   await this.redisService.set(`blacklist:${clamis.jti}`, 'true', ttl);
  // }
}
