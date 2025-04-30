import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { UserService } from './user.service';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RequestedUser } from '@root/commons/decorators/request-user.decorator';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { FindUserDto } from '@root/modules/user/dto/find-user.dto';
import { UpdateUserDto } from '@root/modules/user/dto/update-user.dto';
import { User } from '@root/models/user.model';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @SuccessApiResponse({
    model: User,
    key: 'user',
    description: 'User profile retrieved successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid token',
  })
  @Get('my')
  async getUserProfile(@RequestedUser() claims: TokenPayloadDto) {
    return this.userService.findOneById(claims.sub);
  }

  @ApiOperation({ summary: 'Find users' })
  @SuccessApiResponse({
    model: User,
    key: 'users',
    description: 'List of users retrieved successfully',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.EMPLOYEE, Role.ADMIN])
  @Get()
  async find(@Query() findUserDto: FindUserDto) {
    return await this.userService.find(findUserDto);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @SuccessApiResponse({
    model: User,
    key: 'user',
    description: 'User profile updated successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Cannot update user profile',
  })
  @Patch()
  async updateUser(
    @RequestedUser() claims: TokenPayloadDto,
    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(claims.sub, updateUserDto);
  }

  @ApiOperation({ summary: 'Update user avatar' })
  @SuccessApiResponse({
    description: 'User avatar updated successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Cannot update user avatar',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueSuffix = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueSuffix);
        },
      }),
    }),
  )
  @Patch('/avatar')
  async updateAvatar(
    @RequestedUser() claims: TokenPayloadDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { sub } = claims;
    return await this.userService.uploadAvatar(sub, file);
  }
}
