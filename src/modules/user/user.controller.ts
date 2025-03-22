import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBadRequestResponse } from '@nestjs/swagger';
import { ApiResponseWrapper } from '@root/commons/decorators/api-response-wrapper.decorator';
import { ApiDocDetail } from '@root/commons/decorators/api-doc-detail.decorator';
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

@ApiTags('Users')
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiDocDetail({ summary: 'Get user profile' })
  @ApiResponseWrapper(User, 'user', 'User profile retrieved successfully')
  @ApiOperation({ summary: "Get the authenticated user's profile" })
  @Get('my')
  async getUserProfile(@RequestedUser() claims: TokenPayloadDto) {
    return this.userService.findOneById(claims.sub);
  }

  @ApiDocDetail({ summary: 'Find users' })
  @ApiResponseWrapper(User, 'users', 'List of users retrieved successfully')
  @ApiOperation({ summary: 'Retrieve a list of users based on query filters' })
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.EMPLOYEE, Role.ADMIN])
  @Get()
  async find(@Query() findUserDto: FindUserDto) {
    console.log('🚀 ~ UserController ~ find ~ findUserDto:', findUserDto);
    return await this.userService.find(findUserDto);
  }

  @ApiDocDetail({ summary: 'Update user profile' })
  @ApiResponseWrapper(User, 'user', 'User profile updated successfully')
  @ApiOperation({ summary: "Update the authenticated user's profile" })
  @ApiBadRequestResponse()
  @Patch()
  async updateUser(
    @RequestedUser() claims: TokenPayloadDto,
    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(claims.sub, updateUserDto);
  }
}
