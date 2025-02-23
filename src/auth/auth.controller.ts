import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserAuthenticationDto } from '@root/auth/dto/user-authentication.dto';
import { UserRegistrationDto } from '@root/auth/dto/user-registration.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async login(
    @Body()
    userAuthenticationDto: UserAuthenticationDto,
  ) {
    return await this.authService.login(userAuthenticationDto);
  }

  @Post('sign-up')
  async register(
    @Body()
    userRegistrationDto: UserRegistrationDto,
  ) {
    return await this.authService.registrate(userRegistrationDto);
  }
}
