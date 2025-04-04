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
import {
  EventEmitter2,
  EventEmitterReadinessWatcher,
  OnEvent,
} from '@nestjs/event-emitter';

import { UserEventsEnum } from '@root/models/enums/user-events.enum';
import { CartEventsEnum } from '@root/models/enums/cart-events.enum';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
  ) {}

  private async validateUniqueField(
    field: string,
    value: any,
    message: string,
    userId?: string,
  ) {
    const isExisted = await this.userModel
      .findOne({
        [field]: value,
        ...(userId && {
          _id: { $neq: userId },
        }),
      })
      .lean();
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

  @OnEvent(UserEventsEnum.USER_FIND_REQUEST, { async: true, promisify: true })
  async findOneById(id: string): Promise<User> {
    const user = await this.userModel
      .findOne(
        { _id: id, isActive: true },
        '-password -isActive -deliveryAddress',
      )
      .lean<User>();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async find({
    page,
    size,
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
          skip: (page - 1) * size,
          size,
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

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email }, '-deliveryAddress -isActive')
      .lean<User>();

    if (!user?.password) {
      throw new BadRequestException('User not found');
    }
    await this.validatePassword(password, user.password);

    delete user.password;
    return user;
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

      await this.eventEmitterReadinessWatcher.waitUntilReady();
      const cartCreationResult = await this.eventEmitter.emitAsync(
        CartEventsEnum.CART_CREATED,
        user.id,
      );
      if (
        !cartCreationResult ||
        cartCreationResult.length === 0 ||
        cartCreationResult[0] instanceof Error
      ) {
        await this.userModel.deleteOne({ _id: user.id });
        throw new InternalServerErrorException(
          'Cannot create user due to failure in cart creation process',
        );
      }

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
