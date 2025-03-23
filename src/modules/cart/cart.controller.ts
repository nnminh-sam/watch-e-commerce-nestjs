import {
  Controller,
  Body,
  Param,
  Get,
  Put,
  UseGuards,
  Post,
  Patch,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { Cart } from '@root/models/cart.model';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { RequestedUser } from '@root/commons/decorators/request-user.decorator';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { UpdateCartDto } from '@root/modules/cart/dto/update-cart.dto';

@ApiTags('Carts')
@UseGuards(JwtGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Find user cart' })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Successfully retrieve user cart',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Cannot find associated cart of requested user',
  })
  @Get()
  async findUserCart(@RequestedUser() claims: TokenPayloadDto): Promise<Cart> {
    return await this.cartService.findOneByUserId(claims.sub);
  }

  @ApiOperation({
    summary: 'Update user cart',
    description: 'Including add a product into cart, update product quantity',
  })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Cart updated successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Product not found',
  })
  @Patch()
  async update(
    @RequestedUser() claims: TokenPayloadDto,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    return this.cartService.updateCart(claims.sub, updateCartDto);
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
