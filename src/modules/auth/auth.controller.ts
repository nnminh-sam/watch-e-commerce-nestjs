import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { AccessToken } from '@root/commons/decorators/access-token.decorator';
import { UserAuthenticationDto } from '@root/modules/auth/dtos/user-authentication.dto';
import { UserRegistrationDto } from '@root/modules/auth/dtos/user-registration.dto';
import { UpdatePasswordDto } from '@root/modules/auth/dtos/update-password.dto';
import { RevokeTokenPayload } from '@root/modules/auth/dtos/revoke-token-payload.dto';
import { RequestedUser } from '@root/commons/decorators/request-user.decorator';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';

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
  async signOut(@AccessToken() token: string) {
    return await this.authService.signOut(token);
  }

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Post('revoke-tokens')
  async revokeTokens(
    @Body()
    revokeTokenPayload: RevokeTokenPayload,
    @RequestedUser() claims: TokenPayloadDto,
    @AccessToken() accessToken: string,
  ) {
    // TODO: return success response
    await this.authService.revokeTokens(
      claims,
      accessToken,
      revokeTokenPayload.refreshToken,
    );
  }

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Patch('/update-password')
  async updatePassword(
    @RequestedUser() claims: TokenPayloadDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    // TODO: return success response
    return await this.authService.changePassword(claims.sub, updatePasswordDto);
  }
}
