import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { Order } from '@root/models/order.model';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrderDto } from './dto/find-order.dto';
import { OrderStatusEnum } from '@root/models/enums/order-status.enum';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RequestedUser } from '@root/commons/decorators/request-user.decorator';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @SuccessApiResponse({
    model: Order,
    key: 'order',
    description: 'Order created successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid input data or missing required fields.',
  })
  @Post()
  async create(
    @RequestedUser() claims: TokenPayloadDto,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.create(claims.sub, createOrderDto);
  }

  @ApiOperation({ summary: 'Find orders by filters' })
  @SuccessApiResponse({
    model: Order,
    key: 'orders',
    description: 'List of orders retrieved successfully',
    isArray: true,
  })
  @Get()
  async find(
    @RequestedUser() claims: TokenPayloadDto,
    @Query() findOrderDto: FindOrderDto,
  ) {
    return this.orderService.find(findOrderDto, claims.sub);
  }

  @ApiOperation({ summary: 'Find an order by ID' })
  @SuccessApiResponse({
    model: Order,
    key: 'order',
    description: 'Order details retrieved successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  @Get(':id')
  async findOne(
    @RequestedUser() claims: TokenPayloadDto,
    @Param('id') id: string,
  ) {
    return this.orderService.findOneById(claims.sub, id);
  }

  @ApiOperation({ summary: 'Cancel an order' })
  @SuccessApiResponse({
    model: Order,
    key: 'order',
    description: 'Order cancelled successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  @Patch(':id/cancel')
  async cancel(
    @RequestedUser() claims: TokenPayloadDto,
    @Param('id') id: string,
  ) {
    return this.orderService.cancelOrder(claims.sub, id);
  }

  @ApiOperation({ summary: 'Update order status' })
  @SuccessApiResponse({
    model: Order,
    key: 'order',
    description: 'Order status updated successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  @Patch(':id/status')
  async updateStatus(
    @RequestedUser() claims: TokenPayloadDto,
    @Param('id') id: string,
    @Body('status') status: OrderStatusEnum,
  ) {
    return this.orderService.updateOrderStatus(claims.sub, id, status);
  }
}
