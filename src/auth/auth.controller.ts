import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserAuthenticationDto } from '@root/auth/dto/user-authentication.dto';
import { UserRegistrationDto } from '@root/auth/dto/user-registration.dto';
import { JwtGuard } from '@root/auth/guard/jwt.guard';
import { Request } from 'express';
import { RevokeTokenPayload } from '@root/auth/dto/revoke-token-payload.dto';
import { AccessToken } from '@root/auth/decorator/access-token.decorator';
import { UpdatePasswordDto } from '@root/auth/dto/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(
    @Body()
    userAuthenticationDto: UserAuthenticationDto,
  ) {
    return await this.authService.signIn(userAuthenticationDto);
  }

  @Post('sign-up')
  async signUp(
    @Body()
    userRegistrationDto: UserRegistrationDto,
  ) {
    return await this.authService.signUp(userRegistrationDto);
  }

  @Get('sign-out')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async signOut(@Req() request: Request) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token: string = authHeader.split(' ')[1];
    return await this.authService.signOut(token);
  }

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Post('revoke-tokens')
  async revokeTokens(
    @Body()
    revokeTokenPayload: RevokeTokenPayload,
    @AccessToken()
    accessToken: string,
  ) {
    return this.authService.revokeTokens(
      accessToken,
      revokeTokenPayload.refreshToken,
    );
  }

  @Patch('update-password')
  async updatePassword(
    @Body()
    updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.authService.updatePassword(updatePasswordDto);
  }
}
