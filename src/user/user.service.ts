import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserCredentialsDto } from '@root/auth/dto/user-credential.dto';
import { UserRegistrationDto } from '@root/auth/dto/user-registration.dto';
import { Role } from '@root/user/entities/role.enum';
import { User } from '@root/user/entities/user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  private async getUserAvailabilityByEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    return user ? true : false;
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async create(userRegistrationDto: UserRegistrationDto) {
    const isEmailTaken = await this.getUserAvailabilityByEmail(
      userRegistrationDto.email,
    );
    if (isEmailTaken) {
      throw new BadRequestException('Email is already taken');
    }

    try {
      const user = new this.userModel({
        ...userRegistrationDto,
        password: await this.hashPassword(userRegistrationDto.password),
        deliveryAddress: [],
      });
      const createdUser = await user.save();
      return createdUser.toJSON();
    } catch (error: any) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException('Cannot create user');
    }
  }

  async getUserCredentialsByEmail(email: string): Promise<UserCredentialsDto> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password +email +id +role');

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role as Role,
    };
  }
}
