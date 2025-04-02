import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from '@root/models/cart.model';
import { Model } from 'mongoose';
import { ProductService } from '@root/modules/product/product.service';
import {
  EventEmitter2,
  EventEmitterReadinessWatcher,
  OnEvent,
} from '@nestjs/event-emitter';
import { CartEventsEnum } from '@root/models/enums/cart-events.enum';
import { Product } from '@root/models/product.model';
import { Spec } from '@root/models/spec.model';
import { ProductStatus } from '@root/models/enums/product-status.enum';
import { RedisCartService } from '@root/database/redis-cart.service';
import { CreateCartDetailDto } from '@root/modules/cart/dto/create-cart-detail.dto';
import { UpdateCartDetailDto } from '@root/modules/cart/dto/update-cart-detail.dto';
import { CartDetail } from '@root/models/cart-detail.model';

@Injectable()
export class CartService {
  private logger: Logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    private readonly productService: ProductService,
    private readonly redisCartService: RedisCartService,
  ) {}

  // private checkInvalidSpecification(
  //   checkingSpecIds: string[],
  //   correctSpecs: Spec[],
  // ): boolean {
  //   const result: number = checkingSpecIds.findIndex(
  //     (checkingSpecId: string): boolean => {
  //       const invalidSpecIndex: number = correctSpecs.findIndex(
  //         (spec: Spec): boolean => spec.id !== checkingSpecId,
  //       );
  //       return invalidSpecIndex === -1;
  //     },
  //   );
  //   return result !== -1;
  // }

  // private async retrieveSpecsFromSpecIds(
  //   productId: string,
  //   specIds: string[],
  // ): Promise<Spec[]> {
  //   const product: Product = await this.productService.findOneById(productId);
  //   if (!product) {
  //     throw new NotFoundException('Product not found');
  //   }

  //   const specs: Spec[] = [];
  //   specIds.forEach((specId: string) => {
  //     const foundSpec = product.specs.find((spec: Spec) => spec.id === specId);
  //     if (!foundSpec) {
  //       throw new BadRequestException(
  //         'Invalid expected product specifications ID ',
  //       );
  //     } else {
  //       specs.push(foundSpec);
  //     }
  //   });
  //   return specs;
  // }

  async findOneByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ userId })
      .select('-userId')
      .lean();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  @OnEvent(CartEventsEnum.CART_CREATED, { async: true, promisify: true })
  async createCart(userId: string): Promise<Cart> {
    try {
      const cartDocument = new this.cartModel({
        userId,
        total: 0,
        details: [],
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

  async createCartDetail(
    userId: string,
    createCartDetailDto: CreateCartDetailDto,
  ) {
    const { productId, quantity, specIds } = createCartDetailDto;

    // Find cart by user id
    const cart = await this.cartModel.findOne({ userId }).select('-userId');
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Find product by product id
    const product: Product = await this.productService.findOneById(productId);
    if (product.stock < quantity) {
      throw new BadRequestException('Invalid quantity');
    }

    // Find product specs by spec ids
    const expectingSpecs: Spec[] = [];
    specIds.forEach((specId: string) => {
      const specIndex: number = product.specs.findIndex(
        (spec: Spec): boolean => spec.id === specId,
      );
      if (specIndex === -1) {
        throw new BadRequestException('Invalid specification ID');
      }
      expectingSpecs.push(product.specs[specIndex]);
    });

    // Check if product is existed in user cart. If yes then update the product specs and quantity
    const cartDetailIndex: number = cart.details.findIndex(
      (cartDetail: CartDetail): boolean => cartDetail.productId === productId,
    );
    // Update product specs and quantity
    if (cartDetailIndex !== -1) {
      cart.details[cartDetailIndex].specs = expectingSpecs;
      cart.details[cartDetailIndex].quantity = quantity;

      try {
        const result = await cart.save();
        return result.toJSON();
      } catch (error: any) {
        this.logger.error(error.message);
        throw new InternalServerErrorException('Cannot create cart detail');
      }
    }

    // Create new detail for user cart
    const cartDetail = {
      productId,
      quantity,
      specs: expectingSpecs,
      name: product.name,
      price: product.price,
      asset: product.assets[0] || '',
      availability: true,
    } as CartDetail;
    cart.details.push(cartDetail);

    // Calculate cart total
    let total: number = 0;
    cart.details.forEach((detail: CartDetail) => {
      total += detail.quantity * detail.price;
    });
    cart.total = total;

    // Save cart
    try {
      const result = await cart.save();
      return result.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Cannot create cart detail');
    }
  }

  async updateCartDetail(
    userId: string,
    cartDetailId: string,
    updateCartDetailDto: UpdateCartDetailDto,
  ) {
    const { quantity, specIds } = updateCartDetailDto;

    // Find cart by user id
    const cart = await this.cartModel.findOne({ userId }).select('-userId');
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Find cart detail by cart detail Id
    const cartDetailIndex: number = cart.details.findIndex(
      (detail: CartDetail): boolean => detail.id === cartDetailId,
    );
    if (cartDetailIndex === -1) {
      throw new NotFoundException('Cart detail not found');
    }

    const productId: string = cart.details[cartDetailIndex].productId;
    // Find product by product id
    const product: Product = await this.productService.findOneById(productId);
    if (product.stock < quantity) {
      throw new BadRequestException('Invalid quantity');
    }

    // Find product specs by spec ids
    const expectingSpecs: Spec[] = [];
    specIds.forEach((specId: string) => {
      const specIndex: number = product.specs.findIndex(
        (spec: Spec): boolean => spec.id === specId,
      );
      if (specIndex === -1) {
        throw new BadRequestException('Invalid specification ID');
      }
      expectingSpecs.push(product.specs[specIndex]);
    });

    // Update cart detail quantity and specs
    cart.details[cartDetailIndex].quantity = quantity;
    cart.details[cartDetailIndex].specs = expectingSpecs;

    // Calculate cart total
    let total: number = 0;
    cart.details.forEach((detail: CartDetail) => {
      total += detail.quantity * detail.price;
    });
    cart.total = total;

    // Save cart
    try {
      const result = await cart.save();
      return result.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Cannot udpate cart detail');
    }
  }

  async deleteCartDetail(userId: string, cartDetailId: string) {
    // Find cart by user id
    const cart = await this.cartModel.findOne({ userId }).select('-userId');
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Find cart detail by cart detail Id
    const cartDetailIndex: number = cart.details.findIndex(
      (detail: CartDetail): boolean => detail.id === cartDetailId,
    );
    if (cartDetailIndex === -1) {
      throw new NotFoundException('Cart detail not found');
    }

    // Remove cart detail by cart detail id
    cart.details = cart.details.filter(
      (detail: CartDetail) => detail.id !== cartDetailId,
    );

    // Calculate cart total
    let total: number = 0;
    cart.details.forEach((detail: CartDetail) => {
      total += detail.quantity * detail.price;
    });
    cart.total = total;

    // Save cart
    try {
      const result = await cart.save();
      return result.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Cannot delete cart detail');
    }
  }

  // TODO: Calculate total for this
  // async updateCart(
  //   userId: string,
  //   CreateCartDetailDto: CreateCartDetailDto,
  // ): Promise<Cart> {
  //   const { productId, quantity, specIds } = CreateCartDetailDto;
  //   if (quantity < 0) {
  //     throw new BadRequestException('Invalid quantity');
  //   }

  //   const cart = await this.cartModel.findOne({ user: userId }).select('-user');
  //   if (!cart) {
  //     throw new BadRequestException('Cart not found');
  //   }

  //   const product: Product = await this.productService.findOneById(productId);
  //   if (!product || product.status !== ProductStatus.AVAILABLE) {
  //     throw new BadRequestException('Product is unavailable');
  //   }

  //   const existedItemIndex: number = cart.details.findIndex(
  //     (CartDetail: CartDetail) => CartDetail.productId.toString() === productId,
  //   );
  //   if (existedItemIndex !== -1) {
  //     if (quantity === 0) {
  //       cart.details.splice(existedItemIndex, 1);
  //     } else if (quantity > product.stock) {
  //       throw new BadRequestException(
  //         'Expected product quantity is unavailable',
  //       );
  //     } else {
  //       cart.details[existedItemIndex].quantity = quantity;
  //       if (specIds && specIds.length > 0) {
  //         const containInvalidSpec: boolean = this.checkInvalidSpecification(
  //           specIds,
  //           product.specs,
  //         );
  //         if (containInvalidSpec) {
  //           throw new BadRequestException(
  //             'Invalid expected product specification',
  //           );
  //         }
  //         cart.details[existedItemIndex].specs = this.retrieveSpecsFromSpecIds(
  //           product,
  //           specIds,
  //         );
  //       }
  //     }
  //   } else {
  //     if (quantity === 0 || product.stock < quantity) {
  //       throw new BadRequestException('Invalid quantity');
  //     }

  //     const containInvalidSpec: boolean = this.checkInvalidSpecification(
  //       specIds,
  //       product.specs,
  //     );
  //     if (containInvalidSpec) {
  //       throw new BadRequestException('Invalid expected product specification');
  //     }

  //     const newItem = {
  //       productId,
  //       quantity,
  //       specs: this.retrieveSpecsFromSpecIds(product, specIds),
  //       name: product.name,
  //       price: product.price,
  //       asset: product.assets[0] || 'This is a fake URL',
  //       availability: true,
  //     } as CartDetail;
  //     cart.details.push(newItem);
  //   }

  //   try {
  //     const updatedCart = await cart.save();
  //     return updatedCart.toJSON();
  //   } catch (error: any) {
  //     this.logger.error(error.message);
  //     throw new BadRequestException('Cannot update cart item');
  //   }
  // }

  // async parseRedisQueryResult(
  //   productId: string,
  //   queryResult: string,
  // ): Promise<CartDetail> {
  //   const product: Product = await this.productService.findOneById(productId);
  //   const queryParts: string[] = queryResult.split('&');
  //   if (!queryParts || queryParts.length < 2) {
  //     throw new BadRequestException('Invalid query result');
  //   }

  //   try {
  //     const quantity: number = parseInt(queryParts[0], 10);
  //     const specIdList: string[] = queryParts.slice(1);
  //     const specs: Spec[] = [];
  //     specIdList.forEach((specId: string) => {
  //       const spec = product.specs.find((spec: Spec) => {
  //         return spec.id === specId;
  //       });
  //       if (!spec) {
  //         throw new BadRequestException('Invalid product specifiaction ID');
  //       }
  //       specs.push(spec);
  //     });

  //     return {
  //       productId,
  //       name: product.name,
  //       price: product.price,
  //       quantity,
  //       asset: product.assets[0] || 'This should be a URL',
  //       specs,
  //       availability: true,
  //     } as CartDetail;
  //   } catch (error: any) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  // buildRedisValue(quantity: number, specIdList: string[]): string {
  //   const values: string[] = [];
  //   values.push(`${quantity}`);
  //   specIdList.forEach((id: string) => {
  //     values.push(id);
  //   });
  //   return values.join('&');
  // }

  // async redis_findCartByUserId(userId: string): Promise<Cart> {
  //   const queryResult: Record<string, string> =
  //     await this.redisCartService.getAllProducts(userId);
  //   const productIds: string[] = Object.keys(queryResult).map(
  //     (rawProductId: string) => {
  //       if (!rawProductId) return '';
  //       return rawProductId.split(':')[1];
  //     },
  //   );
  //   let total = 0;
  //   const details: CartDetail[] = await Promise.all(
  //     productIds.map(async (productId: string) => {
  //       const CartDetail: CartDetail = await this.parseRedisQueryResult(
  //         productId,
  //         queryResult[`product:${productId}`],
  //       );
  //       total += CartDetail.price * CartDetail.quantity;
  //       return CartDetail;
  //     }),
  //   );
  //   return {
  //     id: `cart:${userId}`,
  //     userId,
  //     total,
  //     details,
  //   } as Cart;
  // }

  // // TODO: add update cart dto validation
  // async redis_addProduct(
  //   userId: string,
  //   CreateCartDetailDto: CreateCartDetailDto,
  // ) {
  //   const { productId, quantity, specIds } = CreateCartDetailDto;
  //   const redisValue: string = this.buildRedisValue(quantity, specIds);
  //   await this.redisCartService.addProduct(userId, productId, redisValue);
  //   return await this.redis_findCartByUserId(userId);
  // }

  // // TODO: add update cart dto validation
  // async redis_updateProduct(
  //   userId: string,
  //   CreateCartDetailDto: CreateCartDetailDto,
  // ) {
  //   const { productId, quantity, specIds } = CreateCartDetailDto;
  //   const redisValue: string = this.buildRedisValue(quantity, specIds);
  //   await this.redisCartService.updateProduct(userId, productId, redisValue);
  //   return await this.redis_findCartByUserId(userId);
  // }

  // async redis_removeProduct(userId: string, productId: string) {
  //   await this.redisCartService.removeProduct(userId, productId);
  //   return await this.redis_findCartByUserId(userId);
  // }
}
