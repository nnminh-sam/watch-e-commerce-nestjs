import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCartItemDto } from '@root/modules/cart/dto/create-cart-item.dto';
import { CartItem } from '@root/models/cart-item.model';
import { Cart, CartDocument } from '@root/models/cart.model';
import { Model } from 'mongoose';
import { ProductService } from '@root/modules/product/product.service';
import {
  EventEmitter2,
  EventEmitterReadinessWatcher,
  OnEvent,
} from '@nestjs/event-emitter';
import { CartEventsEnum } from '@root/models/enums/cart-events.enum';
import { UpdateCartDto } from '@root/modules/cart/dto/update-cart.dto';
import { Product } from '@root/models/product.model';
import { Spec } from '@root/models/spec.model';
import { ProductStatus } from '@root/models/enums/product-status.enum';

@Injectable()
export class CartService {
  private logger: Logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    private readonly productService: ProductService,
  ) {}

  private checkInvalidSpecification(
    checkingSpecIdList: string[],
    correctSpecList: Spec[],
  ): boolean {
    const result: number = checkingSpecIdList.findIndex(
      (checkingSpecId: string): boolean => {
        const invalidSpecIndex: number = correctSpecList.findIndex(
          (spec: Spec): boolean => spec.id !== checkingSpecId,
        );
        return invalidSpecIndex === -1;
      },
    );
    return result !== -1;
  }

  private retrieveSpecListFromSpecIdList(
    product: Product,
    specIdList: string[],
  ): Spec[] {
    const result: Spec[] = [];
    specIdList.forEach((specId: string) => {
      const foundSpec = product.spec.find((spec: Spec) => spec.id === specId);
      if (!foundSpec) {
        throw new BadRequestException(
          'Invalid expected product specifications ID ',
        );
      }
      result.push(foundSpec);
    });
    return result;
  }

  async findOne(id: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ _id: id }, 'items')
      .lean<Cart>();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async findOneByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({
        user: userId,
      })
      .lean();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  @OnEvent(CartEventsEnum.CART_CREATED, { async: true, promisify: true })
  async create(userId: string): Promise<Cart> {
    try {
      const cartDocument = new this.cartModel({
        user: userId,
        items: [],
      });
      const cart = await cartDocument.save();
      return cart.toJSON();
    } catch (error: any) {
      this.logger.error(`Error creating cart: ${error.message}`);
      if (error.code === 'E11000') {
        throw new BadRequestException(error.message);
      }
      switch (error.name) {
        case 'ValidationError':
          throw new BadRequestException('Cart data validation failed');
        case 'CastError':
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Unable to create cart');
      }
    }
  }

  async updateCart(
    userId: string,
    updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    const { productId, quantity, specIdList } = updateCartDto;
    if (quantity < 0) {
      throw new BadRequestException('Invalid quantity');
    }

    const cart = await this.cartModel.findOne({ user: userId }).select('-user');
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    const product: Product = await this.productService.findOneById(productId);
    if (!product || product.status !== ProductStatus.AVAILABLE) {
      throw new BadRequestException('Product is unavailable');
    }

    const existedItemIndex: number = cart.items.findIndex(
      (cartItem: CartItem) => cartItem.productId.toString() === productId,
    );
    if (existedItemIndex !== -1) {
      if (quantity === 0) {
        cart.items.splice(existedItemIndex, 1);
      } else if (quantity > product.stock) {
        throw new BadRequestException(
          'Expected product quantity is unavailable',
        );
      } else {
        cart.items[existedItemIndex].quantity = quantity;
        if (specIdList && specIdList.length > 0) {
          const containInvalidSpec: boolean = this.checkInvalidSpecification(
            specIdList,
            product.spec,
          );
          if (containInvalidSpec) {
            throw new BadRequestException(
              'Invalid expected product specification',
            );
          }
          cart.items[existedItemIndex].specList =
            this.retrieveSpecListFromSpecIdList(product, specIdList);
        }
      }
    } else {
      if (quantity === 0 || product.stock < quantity) {
        throw new BadRequestException('Invalid quantity');
      }

      const containInvalidSpec: boolean = this.checkInvalidSpecification(
        specIdList,
        product.spec,
      );
      if (containInvalidSpec) {
        throw new BadRequestException('Invalid expected product specification');
      }

      const newItem: CartItem = {
        productId,
        quantity,
        specList: this.retrieveSpecListFromSpecIdList(product, specIdList),
        name: product.name,
        price: product.price,
        asset: product.assets[0] || 'This is a fake URL',
        availability: true,
      };
      cart.items.push(newItem);
    }

    try {
      const updatedCart = await cart.save();
      return updatedCart.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot update cart item');
    }
  }
}
