import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCartItemDto } from '@root/modules/cart/dto/create-cart-item.dto';
import { CreateCartDto } from '@root/modules/cart/dto/create-cart.dto';
import { UpdateCartItemDto } from '@root/modules/cart/dto/update-cart-item.dto';
import { CartItem } from '@root/models/cart-item.model';
import { Cart, CartDocument } from '@root/models/cart.model';
import { RedisService } from '@root/database/redis.service';

import { Model } from 'mongoose';
import { ProductService } from '@root/modules/product/product.service';

@Injectable()
export class CartService {
  private logger: Logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    private readonly redisService: RedisService,
    private readonly productService: ProductService,
  ) {}

  async create(createCartDto: CreateCartDto) {
    try {
      const document = await this.cartModel.create(createCartDto);
      const cart = await document.save();
      return cart.toJSON();
    } catch (error: any) {
      this.logger.log(error.message);
      throw new BadRequestException('Cannot create cart');
    }
  }

  async createCartItem(createCartItemDto: CreateCartItemDto) {
    try {
      const product = await this.productService.findOne(
        createCartItemDto.productId,
      );
      if (!product) {
        throw new BadRequestException('Product not found');
      }

      const cartItem: CartItem = {
        productId: createCartItemDto.productId,
        name: product.name,
        price: createCartItemDto.price,
        quantity: createCartItemDto.quantity,
        spec: createCartItemDto.spec,
        asset: product.assets[0] || '',
        availability: true,
      };

      const updatedCart = await this.cartModel.findOneAndUpdate(
        { _id: createCartItemDto.cartId },
        {
          $push: { items: cartItem },
          $inc: { total: cartItem.quantity * cartItem.price },
        },
        { new: true, upsert: true },
      );
      if (!updatedCart) {
        throw new BadRequestException('Cart not found');
      }
      return updatedCart.toJSON();
    } catch (error: any) {
      this.logger.log(error.message);
      throw new BadRequestException('Cannot create cart item');
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
