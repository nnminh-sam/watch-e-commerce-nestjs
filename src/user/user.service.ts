import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserCredentialsDto } from '@root/auth/dto/user-credential.dto';
import { UserRegistrationDto } from '@root/auth/dto/user-registration.dto';
import { Role } from '@root/user/entities/role.enum';
import { User, UserDocument } from '@root/user/entities/user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '@root/user/dto/update-user.dto';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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
    const user = await this.userModel.findOne(
      { email },
      {
        password: 1,
        email: 1,
        id: 1,
        role: 1,
      },
    );

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

  async findOneById(id: string) {
    const user = await this.userModel.findOne(
      {
        _id: id,
        isActive: true,
      },
      { password: 0, role: 0, isActive: 0, deliveryAddress: 0 },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.toJSON();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findOne({ _id: id, isActive: true });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await user.updateOne(updateUserDto, { new: true });
      return await this.findOneById(id);
    } catch (error: any) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException('Cannot update user');
    }
  }
}
