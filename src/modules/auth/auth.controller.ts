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
import { ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';
import { TokenResponseDto } from '@root/modules/auth/dtos/tokens-response.dto';
import { ApiResponseWrapper } from '@root/commons/decorators/api-response-wrapper.decorator';
import { ApiDocDetail } from '@root/commons/decorators/api-doc-detail.decorator';

@ApiTags('Authentications')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiDocDetail({ summary: 'User sign-in' })
  @ApiResponseWrapper(TokenResponseDto, 'tokens', 'Successful sign-in')
  @ApiBadRequestResponse()
  @HttpCode(200)
  @Post('sign-in')
  async signIn(@Body() userAuthenticationDto: UserAuthenticationDto) {
    return await this.authService.signIn(userAuthenticationDto);
  }

  @ApiDocDetail({ summary: 'User registration' })
  @ApiResponseWrapper(TokenResponseDto, 'tokens', 'Successful sign-up')
  @ApiBadRequestResponse()
  @HttpCode(200)
  @Post('sign-up')
  async signUp(@Body() userRegistrationDto: UserRegistrationDto) {
    return await this.authService.signUp(userRegistrationDto);
  }

  @ApiDocDetail({ summary: 'User sign-out' })
  @ApiResponseWrapper(String, 'message', 'Successful sign-out')
  @Get('sign-out')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async signOut(@AccessToken() token: string) {
    return await this.authService.signOut(token);
  }

  @ApiDocDetail({ summary: 'Revoke tokens' })
  @ApiResponseWrapper(TokenResponseDto, 'tokens', 'Tokens revoked successfully')
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

  @ApiDocDetail({ summary: 'Update user password' })
  @ApiResponseWrapper(String, 'message', 'Password updated successfully')
  @Patch('/update-password')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async updatePassword(
    @RequestedUser() claims: TokenPayloadDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.authService.changePassword(claims.sub, updatePasswordDto);
  }
}
