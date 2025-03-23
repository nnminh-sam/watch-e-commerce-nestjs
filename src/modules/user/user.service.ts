import {
  BadRequestException,
  Inject,
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
import { ClientProxy } from '@nestjs/microservices';
import { ClientsEnum } from '@root/microservices/clients.enum';
import { firstValueFrom } from 'rxjs';
import { CartPattern } from '@root/modules/cart/cart-pattern.enum';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(ClientsEnum.REDIS_RPC)
    private readonly redisRpcClient: ClientProxy,
  ) {}

  private async validateUniqueField(
    field: string,
    value: any,
    message: string,
    userId?: string,
  ) {
    const isExisted = await this.userModel.findOne({
      [field]: value,
      ...(userId && {
        _id: { $neq: userId },
      }),
    });
    if (isExisted) {
      throw new BadRequestException(message);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) throw new BadRequestException('Invalid credentials');
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel
      .findOne(
        { _id: id, isActive: true },
        '-password -role -isActive -deliveryAddress',
      )
      .lean<User>();
    if (!user) throw new NotFoundException('User not found');

    return user;
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

    const searchQuery = searchTerms.length
      ? { $text: { $search: searchTerms.join(' ') } }
      : {};

    try {
      const users = await this.userModel
        .find({ ...filter, ...searchQuery }, '-deliveryAddress', {
          skip: (page - 1) * limit,
          limit,
          sort: { [sortBy]: orderBy },
        })
        .lean();

      return users;
    } catch (error: any) {
      this.logger.error(`Error creating user: ${error.message}`);
      switch (error.name) {
        case 'ValidationError':
          throw new BadRequestException('User data validation failed');
        case 'CastError':
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Unable to create user');
      }
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserCredentialsDto> {
    const user = await this.userModel
      .findOne({ email }, 'password email id role')
      .lean<User>();

    if (!user) throw new BadRequestException('User not found');
    await this.validatePassword(password, user.password);

    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
    };
  }

  async create(userRegistrationDto: UserRegistrationDto): Promise<User> {
    await this.validateUniqueField(
      'email',
      userRegistrationDto.email,
      'Email is already in use',
    );
    await this.validateUniqueField(
      'phoneNumber',
      userRegistrationDto.phoneNumber,
      'Phone number is already in use',
    );

    try {
      const userModel = new this.userModel({
        ...userRegistrationDto,
        password: await this.hashPassword(userRegistrationDto.password),
        deliveryAddress: [],
      });
      const user = await userModel.save();

      console.log('🚀 ~ UserService ~ create ~ Sending RPC request:');
      // const result = await firstValueFrom(
      //   this.redisRpcClient.send(CartPattern.CART_CREATE, user.id),
      // );
      // console.log('🚀 ~ UserService ~ create ~ result:', result);

      return user.toJSON();
    } catch (error: any) {
      this.logger.error(`Error creating user and cart: ${error.message}`);
      switch (error.name) {
        case 'ValidationError':
          throw new BadRequestException('User data validation failed');
        case 'CastError':
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException(
            error.message || 'Failed to create user and cart',
          );
      }
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.phoneNumber) {
      await this.validateUniqueField(
        'phoneNumber',
        updateUserDto.phoneNumber,
        'Phone number is already in use',
        id,
      );
    }

    try {
      const user = await this.userModel
        .findOneAndUpdate(
          { _id: id, isActive: true },
          { $set: updateUserDto },
          { new: true },
        )
        .select('-isActive -deliveryAddress')
        .lean<User>();
      if (!user) throw new NotFoundException('User not found');

      return user;
    } catch (error: any) {
      this.logger.error(`Error creating user: ${error.message}`);
      switch (error.name) {
        case 'ValidationError':
          throw new BadRequestException('User data validation failed');
        case 'CastError':
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Unable to update user');
      }
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<User> {
    try {
      const user = await this.userModel
        .findOneAndUpdate(
          { _id: id, isActive: true },
          { password: await this.hashPassword(newPassword) },
          { new: true },
        )
        .select('-isActive -deliveryAddress')
        .lean<User>();
      if (!user) throw new NotFoundException('User not found');

      return user;
    } catch (error: any) {
      this.logger.error(`Error creating user: ${error.message}`);
      switch (error.name) {
        case 'ValidationError':
          throw new BadRequestException('User data validation failed');
        case 'CastError':
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Unable to create user');
      }
    }
  }
}
