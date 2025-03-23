import { Controller, Body, Param, Get, Put, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { Cart } from '@root/models/cart.model';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';

@ApiTags('Carts')
@UseGuards(JwtGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Update cart' })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Cart updated successfully',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Product not found',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Put('item')
  async updateCartItem(@Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(updateCartItemDto);
  }

  @ApiOperation({ summary: 'Find cart by cart id' })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Cart detail by id',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Get(':id')
  async getCartById(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @ApiOperation({ summary: 'Find cart by user id' })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Cart detail by user id',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'User not found',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Get('user/:userId')
  async getCartByUserId(@Param('userId') userId: string) {
    return this.cartService.findOneByUserId(userId);
  }
}
