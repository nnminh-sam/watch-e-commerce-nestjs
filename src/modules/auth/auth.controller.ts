import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedResponseDto } from '@root/modules/auth/dtos/tokens-response.dto';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';

@ApiTags('Authentications')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User sign-in' })
  @SuccessApiResponse({
    model: AuthenticatedResponseDto,
    key: 'data',
    description: 'Successful sign-in',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid credentials',
  })
  @HttpCode(200)
  @Post('sign-in')
  async signIn(@Body() userAuthenticationDto: UserAuthenticationDto) {
    return await this.authService.signIn(userAuthenticationDto);
  }

  @ApiOperation({ summary: 'User registration' })
  @SuccessApiResponse({
    model: AuthenticatedResponseDto,
    key: 'data',
    description: 'Successful sign-up',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Email or phone number has been taken',
  })
  @HttpCode(200)
  @Post('sign-up')
  async signUp(@Body() userRegistrationDto: UserRegistrationDto) {
    return await this.authService.signUp(userRegistrationDto);
  }

  @ProtectedApi({ summary: 'User sign-out' })
  @SuccessApiResponse({
    description: 'Successful sign-out',
    messageKeyExample: 'Sign out success',
  })
  @Get('sign-out')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async signOut(@AccessToken() token: string) {
    return await this.authService.signOut(token);
  }

  @ProtectedApi({ summary: 'Revoke tokens' })
  @SuccessApiResponse({
    model: AuthenticatedResponseDto,
    key: 'data',
    description: 'Tokens revoked successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid tokens',
  })
  @Post('revoke-tokens')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async revokeTokens(
    @Body() revokeTokenPayload: RevokeTokenPayload,
    @RequestedUser() claims: TokenPayloadDto,
    @AccessToken() accessToken: string,
  ) {
    return await this.authService.revokeTokens(
      claims,
      accessToken,
      revokeTokenPayload.refreshToken,
    );
  }

  @ProtectedApi({ summary: 'Update user password' })
  @SuccessApiResponse({
    model: String,
    key: 'message',
    description: 'Password updated successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid credentials or invalid token',
  })
  @Patch('/update-password')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async updatePassword(
    @RequestedUser() claims: TokenPayloadDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.authService.changePassword(claims.sub, updatePasswordDto);
  }

  @Post('forgot-password')
  @SuccessApiResponse({
    model: String,
    key: 'message',
    description: 'Password reset email sent successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'User not found',
  })
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(@Body() email: string) {
    return await this.authService.forgotPassword(email);
  }
}
