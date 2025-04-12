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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
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
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';

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

  @ApiOperation({
    summary: 'Find orders by filters',
    description:
      'If request user is CUSTOMER role, they must only search for THEIR OWN ORDERS. For other roles, they can specific filter which user order they are searching for',
  })
  @SuccessApiResponse({
    model: Order,
    key: 'orders',
    description: 'List of orders retrieved successfully',
    isArray: true,
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Request user with CUSTOMER role find for other user orders.',
  })
  @Get()
  async find(
    @RequestedUser() claims: TokenPayloadDto,
    @Query() findOrderDto: FindOrderDto,
  ) {
    return this.orderService.find(findOrderDto, claims);
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
    return this.orderService.findOneById(id, claims);
  }

  @ProtectedApi({
    summary: 'Update order status',
    roles: [Role.ADMIN, Role.EMPLOYEE],
    description:
      'API for changing order status. Including Cancel order, request for refund.',
  })
  @SuccessApiResponse({
    model: Order,
    key: 'order',
    description: 'Order status updated successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(RoleGuard)
  @Patch(':id')
  async updateStatus(
    @RequestedUser() claims: TokenPayloadDto,
    @Param('id') id: string,
    @Query('status') status: OrderStatusEnum,
  ) {
    return this.orderService.updateOrderStatus(id, status, claims);
  }
}
