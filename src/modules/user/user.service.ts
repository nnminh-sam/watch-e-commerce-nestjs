import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from '@root/models/enums/role.enum';
import { User, UserDocument } from '@root/models/user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRegistrationDto } from '@root/modules/auth/dtos/user-registration.dto';
import { UserCredentialsDto } from '@root/modules/auth/dtos/user-credential.dto';
import { FindUserDto } from '@root/modules/user/dto/find-user.dto';
import { UpdateUserDto } from '@root/modules/user/dto/update-user.dto';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private async existBy(payload: Record<string, any>): Promise<boolean> {
    const result = await this.userModel.countDocuments({ ...payload });
    return result > 0;
  }

  private async validateEmail(email: string) {
    const isExisted = await this.existBy({ email });
    if (isExisted) throw new BadRequestException('Email is taken');
  }

  private async validatePhoneNumber(phoneNumber: string) {
    const isExisted = await this.existBy({ phoneNumber });
    if (isExisted) throw new BadRequestException('Phone number is taken');
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  private validatePassword(password: string, hashedPassword: string) {
    const isPasswordsMatch = bcrypt.compareSync(password, hashedPassword);
    if (!isPasswordsMatch) throw new BadRequestException('Wrong password');
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne<UserDocument>(
      { email },
      {
        password: 1,
        email: 1,
        id: 1,
        role: 1,
      },
    );
    if (!user) throw new BadRequestException('User not found');

    this.validatePassword(password, user.password);

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role as Role,
    } as UserCredentialsDto;
  }

  async create(userRegistrationDto: UserRegistrationDto) {
    await this.validateEmail(userRegistrationDto.email);
    await this.validatePhoneNumber(userRegistrationDto.phoneNumber);

    try {
      const user: UserDocument = new this.userModel({
        ...userRegistrationDto,
        password: await this.hashPassword(userRegistrationDto.password),
        deliveryAddress: [],
      });
      const createdUser = await user.save();
      return createdUser.toJSON();
    } catch (error: any) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException('Cannot create user');
    }
  }

  async findOneById(id: string) {
    const user = await this.userModel.findOne<UserDocument>(
      { _id: id, isActive: true },
      { password: 0, role: 0, isActive: 0, deliveryAddress: 0 },
    );
    if (!user) throw new NotFoundException('User not found');
    return user.toJSON();
  }

  async find({
    page,
    limit,
    sortBy,
    orderBy,
    firstName,
    lastName,
    ...filter
  }: FindUserDto) {
    const searchTerms = [];
    if (firstName) searchTerms.push(firstName);
    if (lastName) searchTerms.push(lastName);

    const searchQuery: Record<string, any> =
      searchTerms.length <= 0
        ? {}
        : { $text: { $search: searchTerms.join(' ') } };
    console.log('🚀 ~ UserService ~ find ~ searchQuery:', searchQuery);

    try {
      const users = await this.userModel.find<UserDocument>(
        {
          ...filter,
          ...searchQuery,
        },
        { deliveryAddress: 0 },
        {
          skip: (page - 1) * limit,
          limit,
          sort: {
            [sortBy]: orderBy,
          },
        },
      );
      return users.map((user: UserDocument) => user.toJSON());
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot find user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.validatePhoneNumber(updateUserDto.phoneNumber);

    const user = await this.userModel
      .findOneAndUpdate<UserDocument>(
        { _id: id, isActive: true },
        updateUserDto,
        { new: true },
      )
      .select('-IsActive -deliveryAddress');

    if (!user) throw new NotFoundException('User not found');
    return user.toJSON();
  }

  async updatePassword(id: string, newPassword: string) {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, isActive: true },
        { password: await this.hashPassword(newPassword) },
        { new: true },
      )
      .select('-isActive -deliveryAddress');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.toJSON();
  }
}
