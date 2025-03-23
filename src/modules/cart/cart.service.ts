import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCartItemDto } from '@root/modules/cart/dto/create-cart-item.dto';
import { UpdateCartItemDto } from '@root/modules/cart/dto/update-cart-item.dto';
import { CartItem } from '@root/models/cart-item.model';
import { Cart, CartDocument } from '@root/models/cart.model';
import { Model } from 'mongoose';
import { ProductService } from '@root/modules/product/product.service';

@Injectable()
export class CartService {
  private logger: Logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    private readonly productService: ProductService,
  ) {}

  private async getValidatedCartItems(
    items: CreateCartItemDto[],
  ): Promise<CartItem[]> {
    if (!items?.length) return [];

    return await Promise.all(
      items.map(async (createCartItemDto) => {
        try {
          return await this.validateCartItem(createCartItemDto);
        } catch (error: any) {
          this.logger.error(`Invalid cart item: ${error.message}`);
          throw new BadRequestException('Invalid cart item');
        }
      }),
    ).then((results) => results.filter((item) => item !== null));
  }

  private calculateTotalPrice(cartItems: CartItem[]): number {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }

  async validateCartItem(
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartItem> {
    const product = await this.productService.findOneById(
      createCartItemDto.productId,
    );
    if (createCartItemDto.quantity > product.stock) {
      throw new BadRequestException('Required quantity is unavailable');
    }

    return {
      productId: createCartItemDto.productId,
      name: product.name,
      price: product.price,
      quantity: createCartItemDto.quantity,
      spec: createCartItemDto.spec,
      asset: product.assets[0] || '',
      availability: true,
    };
  }

  // @MessagePattern(CartEventsEnum.CART_CREATED, { async: true, promisify: true })
  async create(userId: string): Promise<Cart> {
    console.log('🚀 ~ CartService ~ create ~ userId:', userId);
    try {
      throw new Error('This is a test error');
      // const cartDocument = new this.cartModel({
      //   user: userId,
      //   items: [],
      // });
      // const cart = await cartDocument.save();
      // return cart.toJSON();
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

  async updateCartItem(updateCartItemDto: UpdateCartItemDto) {
    try {
      const { cartId, productId, quantity, spec } = updateCartItemDto;

      const cart = await this.cartModel.findOne({ _id: cartId });

      if (!cart) {
        throw new BadRequestException('Cart not found');
      }

      const cartItem = cart.items.find(
        (item) => item.productId.toString() === productId,
      );
      if (!cartItem) {
        throw new BadRequestException('Cart item not found');
      }

      const oldTotal = cartItem.price * cartItem.quantity;
      const newTotal = cartItem.price * (quantity ?? cartItem.quantity);

      const updatedCart = await this.cartModel.findOneAndUpdate(
        { _id: cartId, 'items.productId': productId },
        {
          $set: {
            'items.$.quantity': quantity ?? cartItem.quantity,
            'items.$.spec': spec ?? cartItem.spec,
          },
          $inc: { total: newTotal - oldTotal },
        },
        { new: true },
      );

      if (!updatedCart) {
        throw new BadRequestException('Failed to update cart item');
      }

      return updatedCart;
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot update cart item');
    }
  }

  async findOne(id: string) {
    const cart = this.cartModel.findOne({
      _id: id,
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async findOneByUserId(userId: string) {
    const cart = this.cartModel.findOne({
      user: userId,
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }
}
