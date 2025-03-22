import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { ApiBadRequestResponse, ApiTags } from '@nestjs/swagger';
import { ApiDocDetail } from '@root/commons/decorators/api-doc-detail.decorator';
import { ApiResponseWrapper } from '@root/commons/decorators/api-response-wrapper.decorator';
import { Cart } from '@root/models/cart.model';

@ApiTags('Carts')
@UseGuards(JwtGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiDocDetail({ summary: 'Create a new cart' })
  @ApiResponseWrapper(Cart, 'cart', 'Cart created successfully')
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Post()
  async createCart(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @ApiDocDetail({ summary: 'Create new cart item' })
  @ApiResponseWrapper(Cart, 'cart', 'Cart item created successfully')
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Post('item')
  async addCartItem(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartService.createCartItem(createCartItemDto);
  }

  @ApiDocDetail({ summary: 'Update cart' })
  @ApiResponseWrapper(Cart, 'cart', 'Cart updated successfully')
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Put('item')
  async updateCartItem(@Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(updateCartItemDto);
  }

  @ApiDocDetail({ summary: 'Find cart by cart id' })
  @ApiResponseWrapper(Cart, 'cart', 'Cart detail by id')
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Get(':id')
  async getCartById(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @ApiDocDetail({ summary: 'Find cart by user id' })
  @ApiResponseWrapper(Cart, 'cart', 'Cart detail by user id')
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Get('user/:userId')
  async getCartByUserId(@Param('userId') userId: string) {
    return this.cartService.findOneByUserId(userId);
  }
}
