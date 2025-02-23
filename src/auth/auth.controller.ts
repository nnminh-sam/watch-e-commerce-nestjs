import {
  Body,
  Controller,
  Get,
  HttpCode,
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
    await this.authService.signOut(token);
    return { message: 'Successfully signed out' };
  }
}
