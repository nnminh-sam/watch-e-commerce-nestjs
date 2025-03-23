import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Cart } from '@root/models/cart.model';
import { CartPattern } from '@root/modules/cart/cart-pattern.enum';
import { CartService } from '@root/modules/cart/cart.service';

@Controller()
export class MicroserviceCartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern(CartPattern.CART_CREATE)
  async create(userId: string): Promise<Cart> {
    return await this.cartService.create(userId);
  }
}
