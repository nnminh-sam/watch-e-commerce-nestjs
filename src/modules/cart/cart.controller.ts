import {
  Controller,
  Body,
  Param,
  Get,
  Put,
  UseGuards,
  Post,
  Patch,
  Version,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { Cart } from '@root/models/cart.model';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { RequestedUser } from '@root/commons/decorators/request-user.decorator';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { UpdateCartDto } from '@root/modules/cart/dto/update-cart.dto';

@ApiTags('Carts')
@ApiBearerAuth()
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
    summary: 'Update user cart (Add product, update quantity, remove product)',
    description:
      'This API support adding new product into cart, update product quantity and removing product out of cart by set the quantity to 0',
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

  @ApiOperation({
    summary: 'Find user cart using Redis.',
  })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Successfully retrieve user cart data',
  })
  @Version('2')
  @Get()
  async getCartRedis(@RequestedUser() claims: TokenPayloadDto): Promise<Cart> {
    return await this.cartService.redis_findCartByUserId(claims.sub);
  }

  @ApiOperation({
    summary:
      'Add product into user cart stored using Redis. This also create user cart if not existed',
  })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Successfully added new product into cart',
  })
  @Version('2')
  @HttpCode(200)
  @Post()
  async addProduct(
    @RequestedUser() claims: TokenPayloadDto,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    return await this.cartService.redis_addProduct(claims.sub, updateCartDto);
  }

  @ApiOperation({
    summary:
      'Update product inside user cart using Redis. This also create user cart if not existed',
  })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Successfully updated product in cart',
  })
  @Version('2')
  @Patch()
  async updateProduct(
    @RequestedUser() claims: TokenPayloadDto,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    return await this.cartService.redis_updateProduct(
      claims.sub,
      updateCartDto,
    );
  }

  @ApiOperation({
    summary: 'Remove product out of user cart using Redis.',
  })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Successfully removed product out of user cart',
  })
  @Version('2')
  @Delete('/:id')
  async removeProduct(
    @RequestedUser() claims: TokenPayloadDto,
    @Param('id') id: string,
  ): Promise<Cart> {
    return await this.cartService.redis_removeProduct(claims.sub, id);
  }
}
