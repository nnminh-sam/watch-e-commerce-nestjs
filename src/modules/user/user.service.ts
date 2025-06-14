import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@root/models/user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRegistrationDto } from '@root/modules/auth/dtos/user-registration.dto';
import { FindUserDto } from '@root/modules/user/dto/find-user.dto';
import { UpdateUserDto } from '@root/modules/user/dto/update-user.dto';
import {
  EventEmitter2,
  EventEmitterReadinessWatcher,
  OnEvent,
} from '@nestjs/event-emitter';

import { UserEventsEnum } from '@root/models/enums/user-events.enum';
import { CartEvent } from '@root/models/enums/cart-events.enum';
import { DeliveryInformation } from '@root/models/delivery-information.model';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CloudinaryService } from '@root/modules/cloudinary/cloudinary.service';
import { ResourceTypeEnum } from '@root/modules/cloudinary/enums/resource-type.enum';
import { EventEnum } from '@root/modules/cloudinary/enums/event.enum';
import { CreateDeliveryAddressDto } from '@root/modules/user/dto/create-delivery-address.dto';
import { FindDeliveryAddressDto } from '@root/modules/user/dto/find-delivery-address.dto';
import { GenericApiResponseDto } from '@root/commons/dtos/generic-api-response.dto';
import { PaginationResponseDto } from '@root/commons/dtos/pagination-response.dto';
import { BaseModel } from '@root/models';
import { add } from 'lodash';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
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
          _id: { $ne: userId },
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

  async findOne(query: any): Promise<User> {
    const user = await this.userModel.findOne(query).lean<User>();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
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
    this.logger.log(
      'User is found',
      `${UserService.name}.${this.findOneById.name}`,
    );

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
        CartEvent.CART_CREATED,
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

  async createDeliveryInformation(
    id: string,
    CreateDeliveryAddressDto: CreateDeliveryAddressDto,
  ) {
    const deliveryInformation = {
      ...CreateDeliveryAddressDto,
    } as DeliveryInformation;
    const user = await this.userModel.findOne({ _id: id });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    try {
      user.deliveryAddress.push(deliveryInformation);
      await user.save();
    } catch (error: any) {
      throw new BadRequestException('Cannot add new delivery information');
    }
  }

  async uploadAvatar(id: string, file: Express.Multer.File) {
    await this.cloudinaryService.uploadFile(
      file,
      ResourceTypeEnum.USER_AVATAR,
      id,
    );

    return 'User avatar uploaded';
  }

  @OnEvent(EventEnum.UPLOAD_AVATAR_COMPLETED)
  private async persitUserAvatar(payload: any) {
    const { resourceType, objectId, publicId, url } = payload;
    if (resourceType !== ResourceTypeEnum.USER_AVATAR) {
      return;
    }

    const user = await this.userModel.findOne({ _id: objectId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatar = url;
    try {
      await user.save();
    } catch (error: any) {
      this.logger.fatal(error.message, UserService.name);
      throw new InternalServerErrorException(
        'Cannot update user avatar',
        error.message,
      );
    }
  }

  async createDeliveryAddress(
    userId: string,
    createDeliveryAddressDto: CreateDeliveryAddressDto,
  ): Promise<DeliveryInformation> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If this is set as default, unset other default addresses
    if (createDeliveryAddressDto.isDefault) {
      user.deliveryAddress.forEach((addr) => (addr.isDefault = false));
    }

    const deliveryAddress = {
      ...createDeliveryAddressDto,
    } as DeliveryInformation;

    user.deliveryAddress.push(deliveryAddress);
    await user.save();

    return deliveryAddress;
  }

  async findDeliveryAddresses(
    userId: string,
    findDeliveryAddressDto: FindDeliveryAddressDto,
  ): Promise<GenericApiResponseDto<DeliveryInformation[]>> {
    const { page, size, sortBy, orderBy, fullName, phoneNumber, city } =
      findDeliveryAddressDto;
    const skip: number = (page - 1) * size;

    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Filter delivery addresses
    let addresses: any[] = user.deliveryAddress;

    if (fullName) {
      addresses = addresses.filter((addr) =>
        addr.fullName.toLowerCase().includes(fullName.toLowerCase()),
      );
    }
    if (phoneNumber) {
      addresses = addresses.filter((addr) =>
        addr.phoneNumber.includes(phoneNumber),
      );
    }
    if (city) {
      addresses = addresses.filter((addr) =>
        addr.city.toLowerCase().includes(city.toLowerCase()),
      );
    }

    // Sort addresses
    addresses.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      return orderBy === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
          ? 1
          : -1;
    });

    // Transform addresses to convert _id to id
    addresses = addresses.map((address) => {
      const addressObj = { ...address._doc };
      if (addressObj._id) {
        addressObj.id = addressObj._id.toString();
        delete addressObj._id;
      }
      return addressObj;
    });

    // Apply pagination
    const total = addresses.length;
    const paginatedAddresses = addresses.slice(skip, skip + size);

    const pagination: PaginationResponseDto = {
      total,
      page,
      perPage: size,
      totalPages: Math.ceil(total / size),
    };

    return new GenericApiResponseDto<DeliveryInformation[]>(
      paginatedAddresses,
      pagination,
    );
  }
}
