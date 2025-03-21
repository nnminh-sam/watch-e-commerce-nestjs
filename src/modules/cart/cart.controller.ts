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

@UseGuards(JwtGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Post()
  async createCart(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Post('item')
  async addCartItem(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartService.createCartItem(createCartItemDto);
  }

  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Put('item')
  async updateCartItem(@Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(updateCartItemDto);
  }

  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Get(':id')
  async getCartById(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @UseGuards(RoleGuard)
  @HasRoles([Role.CUSTOMER])
  @Get('user/:userId')
  async getCartByUserId(@Param('userId') userId: string) {
    return this.cartService.findOneByUserId(userId);
  }
}
