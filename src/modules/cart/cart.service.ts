import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, raw } from '@nestjs/mongoose';
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
import { RedisCartService } from '@root/database/redis-cart.service';

@Injectable()
export class CartService {
  private logger: Logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    private readonly productService: ProductService,
    private readonly redisCartService: RedisCartService,
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

  // TODO: Calculate total for this
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

  async parseRedisQueryResult(
    productId: string,
    queryResult: string,
  ): Promise<CartItem> {
    const product: Product = await this.productService.findOneById(productId);
    const queryParts: string[] = queryResult.split('&');
    if (!queryParts || queryParts.length < 2) {
      throw new BadRequestException('Invalid query result');
    }

    try {
      const quantity: number = parseInt(queryParts[0], 10);
      const specIdList: string[] = queryParts.slice(1);
      const specList: Spec[] = [];
      specIdList.forEach((specId: string) => {
        const spec = product.spec.find((spec: Spec) => {
          return spec.id === specId;
        });
        if (!spec) {
          throw new BadRequestException('Invalid product specifiaction ID');
        }
        specList.push(spec);
      });

      return {
        productId,
        name: product.name,
        price: product.price,
        quantity,
        asset: product.assets[0] || 'This should be a URL',
        specList,
        availability: true,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  buildRedisValue(quantity: number, specIdList: string[]): string {
    const values: string[] = [];
    values.push(`${quantity}`);
    specIdList.forEach((id: string) => {
      values.push(id);
    });
    return values.join('&');
  }

  async redis_findCartByUserId(userId: string): Promise<Cart> {
    const queryResult: Record<string, string> =
      await this.redisCartService.getAllProducts(userId);
    const productIds: string[] = Object.keys(queryResult).map(
      (rawProductId: string) => {
        if (!rawProductId) return '';
        return rawProductId.split(':')[1];
      },
    );
    let total = 0;
    const items: CartItem[] = await Promise.all(
      productIds.map(async (productId: string) => {
        const cartItem: CartItem = await this.parseRedisQueryResult(
          productId,
          queryResult[`product:${productId}`],
        );
        total += cartItem.price * cartItem.quantity;
        return cartItem;
      }),
    );
    return {
      id: `cart:${userId}`,
      user: userId,
      total,
      items,
    };
  }

  // TODO: add update cart dto validation
  async redis_addProduct(userId: string, updateCartDto: UpdateCartDto) {
    const { productId, quantity, specIdList } = updateCartDto;
    const redisValue: string = this.buildRedisValue(quantity, specIdList);
    await this.redisCartService.addProduct(userId, productId, redisValue);
    return await this.redis_findCartByUserId(userId);
  }

  // TODO: add update cart dto validation
  async redis_updateProduct(userId: string, updateCartDto: UpdateCartDto) {
    const { productId, quantity, specIdList } = updateCartDto;
    const redisValue: string = this.buildRedisValue(quantity, specIdList);
    await this.redisCartService.updateProduct(userId, productId, redisValue);
    return await this.redis_findCartByUserId(userId);
  }

  async redis_removeProduct(userId: string, productId: string) {
    await this.redisCartService.removeProduct(userId, productId);
    return await this.redis_findCartByUserId(userId);
  }
}
