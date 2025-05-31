import { MailingService } from '@root/modules/mailing/mailing.service';
import { BlackListTokenMessage } from './../../models/enums/black-list-token-message.enum';
import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { TokenBlackListService } from '@root/database/token-black-list.service';
import { EnvironmentService } from '@root/environment/environment.service';
import { User } from '@root/models/user.model';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { AuthenticatedResponseDto } from '@root/modules/auth/dtos/tokens-response.dto';
import { UpdatePasswordDto } from '@root/modules/auth/dtos/update-password.dto';
import { UserAuthenticationDto } from '@root/modules/auth/dtos/user-authentication.dto';
import { UserRegistrationDto } from '@root/modules/auth/dtos/user-registration.dto';
import { JwtManagerService } from '@root/modules/jwt-manager/jwt-manager.service';
import { UserService } from '@root/modules/user/user.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { welcomeContext } from '@root/modules/mailing';

@Injectable()
export class AuthService {
  constructor(
    private readonly TokenBlackListService: TokenBlackListService,
    private readonly jwtManagerService: JwtManagerService,
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
    private readonly mailingService: MailingService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  private generateTokens(tokenPayload: TokenPayloadDto) {
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

  async signIn({
    email,
    password,
  }: UserAuthenticationDto): Promise<AuthenticatedResponseDto> {
    const user: User = await this.userService.validateUser(email, password);

    const tokenPayload: TokenPayloadDto = {
      jit: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      sub: user.id,
      email,
      role: user.role,
    };
    const { accessToken, refreshToken } = this.generateTokens(tokenPayload);
    this.logger.log({
      message: 'User signed in',
    });
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async signUp(
    userRegistrationDto: UserRegistrationDto,
  ): Promise<AuthenticatedResponseDto> {
    const user: User = await this.userService.create(userRegistrationDto);

    const tokenPayload: TokenPayloadDto = {
      jit: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const { accessToken, refreshToken } = this.generateTokens(tokenPayload);
    this.mailingService.sendMail({
      to: user.email,
      subject: welcomeContext.subject,
      template: welcomeContext.template,
      context: {
        [welcomeContext.context.name]: `${user.firstName} ${user.lastName}`,
      },
    });
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async signOut(token: string) {
    const claims = await this.jwtManagerService.validateToken(token);
    if (!claims) throw new BadRequestException('Invalid token');

    await this.TokenBlackListService.invalidateTokenToBlackList(
      claims,
      BlackListTokenMessage.SIGNED_OUT,
    );

    return 'Signed out success';
  }

  private async revokeToken(token: string, tokenName: string = 'token') {
    const invalidTokenMessage = `Invalid ${tokenName}`;

    const claims = await this.jwtManagerService.validateToken(token);
    if (!claims) throw new BadRequestException(invalidTokenMessage);

    const isBlackListedToken =
      await this.TokenBlackListService.validateBlackListedToken(claims);
    if (isBlackListedToken) throw new BadRequestException(invalidTokenMessage);

    const blackListedToken =
      await this.TokenBlackListService.invalidateTokenToBlackList(
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
    const result = await this.TokenBlackListService.invalidateTokenToBlackList(
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
    if (!result)
      throw new BadRequestException('Cannot black list change password token');

    return 'Change password success';
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate a strong random password
    const newPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).toUpperCase().slice(-8) +
      Math.random().toString(36).slice(-8);

    // Update user's password
    await this.userService.updatePassword(user.id, newPassword);

    // Send email with new password
    await this.mailingService.sendMail({
      to: email,
      subject: 'Password Reset',
      template: 'password-reset',
      context: {
        name: `${user.firstName} ${user.lastName}`,
        newPassword,
      },
    });

    return 'Password reset email sent successfully';
  }
}
