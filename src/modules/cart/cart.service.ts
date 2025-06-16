import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart } from '@root/models/cart.model';
import { ProductService } from '@root/modules/product/product.service';
import { OnEvent } from '@nestjs/event-emitter';
import { CartEvent } from '@root/models/enums/cart-events.enum';
import { Product } from '@root/models/product.model';
import { Spec } from '@root/models/spec.model';
import { CreateCartDetailDto } from '@root/modules/cart/dto/create-cart-detail.dto';
import { UpdateCartDetailDto } from '@root/modules/cart/dto/update-cart-detail.dto';
import { CartDetail } from '@root/models/cart-detail.model';
import { CartRepository } from '@root/modules/cart/cart.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productService: ProductService,
  ) {}

  private calculateCartTotal(cart: Cart): number {
    return cart.details.reduce(
      (total, detail: CartDetail) => (total += detail.price * detail.quantity),
      0,
    );
  }

  private findProductSpec(product: Product, specIds: string[]): Spec[] {
    return specIds.map((specId: string) => {
      const spec: Spec | undefined = product.specs.find(
        (s: Spec) => s.id === specId,
      );
      if (!spec) {
        throw new BadRequestException('Invalid specification ID');
      }
      return spec;
    });
  }

  // * Factory method for creating cart detail [Factory Pattern]
  private cartDetailFactory(product: Product, quantity: number, specs: Spec[]) {
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      specs,
      asset: product.assets[0] || '',
      availability: true,
    } as CartDetail;
  }

  async findOneByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne(
      { userId },
      { userId: 0 },
      { lean: true },
    );
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  @OnEvent(CartEvent.CART_CREATED, { async: true, promisify: true })
  async createCart(userId: string): Promise<Cart> {
    return await this.cartRepository.create(userId);
  }

  async createCartDetail(
    userId: string,
    createCartDetailDto: CreateCartDetailDto,
  ) {
    const { productId, quantity, specIds } = createCartDetailDto;

    const cart = await this.cartRepository.findOne({ userId }, { userId: 0 });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const product: Product = await this.productService.findOneById(productId);
    if (product.stock < quantity) {
      throw new BadRequestException('Invalid quantity');
    }

    const specs: Spec[] = specIds?.length
      ? this.findProductSpec(product, specIds)
      : [];

    const existingDetail = cart.details.find(
      (detail: CartDetail) => detail.productId === productId,
    );
    if (existingDetail) {
      existingDetail.quantity = quantity;
      existingDetail.specs = specs;
    } else {
      cart.details.push(this.cartDetailFactory(product, quantity, specs));
    }

    cart.total = this.calculateCartTotal(cart);

    return await this.cartRepository.save(cart);
  }

  async updateCartDetail(
    userId: string,
    cartDetailId: string,
    updateCartDetailDto: UpdateCartDetailDto,
  ) {
    const { quantity, specIds } = updateCartDetailDto;

    const cart = await this.cartRepository.findOne({ userId }, { userId: 0 });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existingDetail = cart.details.find(
      (detail) => detail.id === cartDetailId,
    );
    if (!existingDetail) {
      throw new NotFoundException('Cart detail not found');
    }

    const product: Product = await this.productService.findOneById(
      existingDetail.productId,
    );
    if (product.stock < quantity) {
      throw new BadRequestException('Invalid quantity');
    }

    const specs: Spec[] = specIds?.length
      ? this.findProductSpec(product, specIds)
      : [];

    existingDetail.quantity = quantity;
    existingDetail.specs = specs;

    cart.total = this.calculateCartTotal(cart);

    return await this.cartRepository.save(cart);
  }

  async deleteCartDetail(userId: string, cartDetailId: string) {
    const cart = await this.cartRepository.findOne({ userId }, { userId: 0 });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existingDetail = cart.details.find(
      (detail) => detail.id === cartDetailId,
    );
    if (!existingDetail) {
      throw new NotFoundException('Cart detail not found');
    }

    cart.details = cart.details.filter(
      (detail: CartDetail) => detail.id !== cartDetailId,
    );

    cart.total = this.calculateCartTotal(cart);

    return this.cartRepository.save(cart);
  }

  async updateCart(userId: string, cart: Cart): Promise<Cart> {
    const existingCart = await this.cartRepository.findOne({ userId });
    if (!existingCart) {
      throw new NotFoundException('Cart not found');
    }

    // Update the cart document
    Object.assign(existingCart, cart);
    return await this.cartRepository.save(existingCart);
  }
}
