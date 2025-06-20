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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { Cart } from '@root/models/cart.model';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { RequestedUser } from '@root/commons/decorators/request-user.decorator';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { CreateCartDetailDto } from '@root/modules/cart/dto/create-cart-detail.dto';
import { UpdateCartDetailDto } from '@root/modules/cart/dto/update-cart-detail.dto';

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

  @ApiOperation({ summary: 'Create new detail in user cart' })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'New product added to cart successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid quantity, specification ID',
  })
  @Post('details')
  async createDetail(
    @RequestedUser() claims: TokenPayloadDto,
    @Body() createCartDetailDto: CreateCartDetailDto,
  ) {
    return await this.cartService.createCartDetail(
      claims.sub,
      createCartDetailDto,
    );
  }

  @ApiOperation({ summary: 'Update cart detail in user cart' })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Cart detail updated successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Cart not found, Cart detail not found',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid quantity, specification ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the updating cart detail',
  })
  @Patch('details/:id')
  async updateDetail(
    @RequestedUser() claims: TokenPayloadDto,
    @Param('id') detailId: string,
    @Body() updateCartDetailDto: UpdateCartDetailDto,
  ) {
    return await this.cartService.updateCartDetail(
      claims.sub,
      detailId,
      updateCartDetailDto,
    );
  }

  @ApiOperation({ summary: 'Delete cart detail in user cart' })
  @SuccessApiResponse({
    model: Cart,
    key: 'cart',
    description: 'Cart detail deleted successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Cart not found, Cart detail not found',
  })
  @ApiParam({
    name: 'detail-id',
    type: 'string',
    description: 'ID of the updating cart detail',
  })
  @Delete('details/:id')
  async deleteDetail(
    @RequestedUser() claims: TokenPayloadDto,
    @Param('id') detailId: string,
  ) {
    return await this.cartService.deleteCartDetail(claims.sub, detailId);
  }

  // @ApiOperation({
  //   summary: 'Update user cart (Add product, update quantity, remove product)',
  //   description:
  //     'This API support adding new product into cart, update product quantity and removing product out of cart by set the quantity to 0',
  // })
  // @SuccessApiResponse({
  //   model: Cart,
  //   key: 'cart',
  //   description: 'Cart updated successfully',
  // })
  // @ClientErrorApiResponse({
  //   status: 400,
  //   description: 'Product not found',
  // })
  // @Patch()
  // async update(
  //   @RequestedUser() claims: TokenPayloadDto,
  //   @Body() CreateCartDetailDto: CreateCartDetailDto,
  // ): Promise<Cart> {
  //   return this.cartService.updateCart(claims.sub, CreateCartDetailDto);
  // }

  // @ApiOperation({
  //   summary: 'Find user cart using Redis.',
  // })
  // @SuccessApiResponse({
  //   model: Cart,
  //   key: 'cart',
  //   description: 'Successfully retrieve user cart data',
  // })
  // @Version('2')
  // @Get()
  // async getCartRedis(@RequestedUser() claims: TokenPayloadDto): Promise<Cart> {
  //   return await this.cartService.redis_findCartByUserId(claims.sub);
  // }

  // @ApiOperation({
  //   summary:
  //     'Add product into user cart stored using Redis. This also create user cart if not existed',
  // })
  // @SuccessApiResponse({
  //   model: Cart,
  //   key: 'cart',
  //   description: 'Successfully added new product into cart',
  // })
  // @Version('2')
  // @HttpCode(200)
  // @Post()
  // async addProduct(
  //   @RequestedUser() claims: TokenPayloadDto,
  //   @Body() CreateCartDetailDto: CreateCartDetailDto,
  // ): Promise<Cart> {
  //   console.log('🚀 ~ CartController ~ CreateCartDetailDto:', CreateCartDetailDto);
  //   return await this.cartService.redis_addProduct(claims.sub, CreateCartDetailDto);
  // }

  // @ApiOperation({
  //   summary:
  //     'Update product inside user cart using Redis. This also create user cart if not existed',
  // })
  // @SuccessApiResponse({
  //   model: Cart,
  //   key: 'cart',
  //   description: 'Successfully updated product in cart',
  // })
  // @Version('2')
  // @Patch()
  // async updateProduct(
  //   @RequestedUser() claims: TokenPayloadDto,
  //   @Body() CreateCartDetailDto: CreateCartDetailDto,
  // ): Promise<Cart> {
  //   return await this.cartService.redis_updateProduct(
  //     claims.sub,
  //     CreateCartDetailDto,
  //   );
  // }

  // @ApiOperation({
  //   summary: 'Remove product out of user cart using Redis.',
  // })
  // @SuccessApiResponse({
  //   model: Cart,
  //   key: 'cart',
  //   description: 'Successfully removed product out of user cart',
  // })
  // @Version('2')
  // @Delete('/:id')
  // async removeProduct(
  //   @RequestedUser() claims: TokenPayloadDto,
  //   @Param('id') id: string,
  // ): Promise<Cart> {
  //   return await this.cartService.redis_removeProduct(claims.sub, id);
  // }
}
