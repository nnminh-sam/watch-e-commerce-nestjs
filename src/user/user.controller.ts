import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '@root/auth/guard/jwt.guard';
import { RequestedUser } from '@root/user/decorator/request-user.decorator';
import { TokenPayloadDto } from '@root/auth/dto/token-payload.dto';
import { RoleGuard } from '@root/user/guard/role.guard';
import { HasRoles } from '@root/user/decorator/has-role.decorator';
import { Role } from '@root/user/entities/role.enum';
import { UpdateUserDto } from '@root/user/dto/update-user.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('my')
  async getUserProfile(@RequestedUser() user: TokenPayloadDto) {
    return this.userService.findOneById(user.sub);
  }

  @Patch()
  async updateUser(
    @RequestedUser() user: TokenPayloadDto,
    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.sub, updateUserDto);
  }
}
