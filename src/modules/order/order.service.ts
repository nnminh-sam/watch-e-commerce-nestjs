import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CartDetail } from '@root/models/cart-detail.model';
import { Cart } from '@root/models/cart.model';
import { DeliveryInformation } from '@root/models/delivery-information.model';
import { OrderStatusEnum } from '@root/models/enums/order-status.enum';
import { Role } from '@root/models/enums/role.enum';
import { TransactionStatus } from '@root/models/enums/transaction-status.enum';
import { OrderDetail } from '@root/models/order-detail.model';
import { Order, OrderDocument } from '@root/models/order.model';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { CartService } from '@root/modules/cart/cart.service';
import { CreateOrderDto } from '@root/modules/order/dto/create-order.dto';
import { FindOrderDto } from '@root/modules/order/dto/find-order.dto';
import { OrderRepository } from '@root/modules/order/order.repository';
import { ProductService } from '@root/modules/product/product.service';
import { UpdateTransactionDto } from '@root/modules/transaction/dto/update-transaction.dto';
import { TransactionService } from '@root/modules/transaction/transaction.service';
import { CreateDeliveryAddressDto } from '@root/modules/user/dto/create-delivery-address.dto';
import { UserService } from '@root/modules/user/user.service';

@Injectable()
export class OrderService {
  private readonly logger: Logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly transactionService: TransactionService,
  ) {}

  private createOrderDetails(cart: Cart, cartDetailIds: string[]) {
    const cartDetails: CartDetail[] = cartDetailIds.map(
      (cartDetailId: string) => {
        const detail = cart.details.find(
          (detail: CartDetail) => detail.id === cartDetailId,
        );
        if (!detail) {
          throw new BadRequestException('Invalid cart detail ID');
        }
        return detail;
      },
    );
    const orderDetails: OrderDetail[] = cartDetails.map(
      (detail: CartDetail) => {
        const { availability, ...rest } = detail;
        if (!availability) {
          throw new BadRequestException('Product is unavailable for purchase');
        }
        return {
          ...rest,
        } as OrderDetail;
      },
    );
    return orderDetails;
  }

  private calculateOrderTotal(orderDetails: OrderDetail[]) {
    return orderDetails.reduce(
      (total, detail: OrderDetail) => (total += detail.price * detail.quantity),
      0,
    );
  }

  private async increaseProductsSold(orderDetails: OrderDetail[]) {
    await Promise.all([
      orderDetails.forEach(async (detail: OrderDetail) => {
        await this.productService.increaseProductSold(
          detail.productId,
          detail.quantity,
        );
      }),
    ]);
    return true;
  }

  private async removeCartDetails(userId: string, cartDetailIds: string[]) {
    try {
      const cart = await this.cartService.findOneByUserId(userId);
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      // Remove all specified details at once
      cart.details = cart.details.filter(
        (detail) => !cartDetailIds.includes(detail.id),
      );

      // Recalculate total
      cart.total = cart.details.reduce(
        (total, detail) => total + detail.price * detail.quantity,
        0,
      );

      // Save the cart with all changes at once
      return await this.cartService.updateCart(userId, cart);
    } catch (error: any) {
      this.logger.error('Cannot remove cart details', error);
      throw new InternalServerErrorException('Failed to update cart');
    }
  }

  /**
   * ! Currently, this will insert a delivery information straight into the user schema without checking existed delivery information
   *
   * @param userId
   * @param CreateDeliveryAddressDto
   * @returns
   */
  private async addDeliveryInformation(
    userId: string,
    CreateDeliveryAddressDto: CreateDeliveryAddressDto,
  ) {
    await this.userService.createDeliveryInformation(
      userId,
      CreateDeliveryAddressDto,
    );
    return true;
  }

  async findOneById(id: string, claims: TokenPayloadDto) {
    const { role, sub } = claims;
    const order = await this.orderRepository.findOne(
      { _id: id },
      {},
      { lean: true },
    );
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (role === Role.CUSTOMER && order.userId !== sub) {
      throw new ForbiddenException('Customer only find their own orders');
    }

    return order;
  }

  async find(findOrderDto: FindOrderDto, requestUserClaims: TokenPayloadDto) {
    const { role, sub } = requestUserClaims;
    const {
      userId,
      orderNumber,
      fromDate,
      toDate,
      status,
      paymentMethod,
      page,
      size,
      sortBy,
      orderBy,
    } = findOrderDto;

    if (role === Role.CUSTOMER && sub !== userId) {
      throw new ForbiddenException('Customer only find their own orders');
    }

    const textFilter: any = orderNumber
      ? { $text: { $search: orderNumber } }
      : {};
    const dateFilter: any = {};
    if (fromDate || toDate) {
      dateFilter['createdAt'] = {
        ...(fromDate && { $gte: new Date(fromDate) }),
        ...(toDate && { $lte: new Date(toDate) }),
      };
    }
    const filters = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...textFilter,
      ...dateFilter,
    };
    const skip: number = (page - 1) * size;
    return await this.orderRepository.find(
      filters,
      {},
      { lean: true, skip: skip, limit: size, sort: { [sortBy]: orderBy } },
    );
  }

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { cartDetailIds, paymentMethod, deliveryAddress, deliveryAddressId } =
      createOrderDto;
    const cart = await this.cartService.findOneByUserId(userId);
    const orderDetails: OrderDetail[] = this.createOrderDetails(
      cart,
      createOrderDto.cartDetailIds,
    );

    const buffer: any = deliveryAddress;
    let deliveryInformation: DeliveryInformation;
    if (deliveryAddressId) {
      deliveryInformation = await this.userService.findDeliveryAddressById(
        userId,
        deliveryAddressId,
      );
      if (!deliveryInformation) {
        throw new BadRequestException('Invalid delivery address ID');
      }
    } else if (deliveryAddress) {
      deliveryInformation = {
        fullName: buffer.full_name,
        phoneNumber: buffer.phone_number,
        city: buffer.city,
        district: buffer.district,
        street: buffer.street,
        specificAddress: buffer.specific_address,
        isDefault: buffer.is_default || false,
      } as DeliveryInformation;
    } else {
      throw new BadRequestException('Cannot create delivery address for order');
    }

    const orderNumber: string = `${Date.now()}`;
    const orderDocument: OrderDocument = this.orderRepository.createDocument({
      userId,
      orderNumber,
      deliveryInformation,
      details: orderDetails,
      total: this.calculateOrderTotal(orderDetails),
      paymentMethod: paymentMethod,
      status: OrderStatusEnum.PENDING,
    } as Order);
    const result = await this.orderRepository.save(orderDocument);

    // TODO: extract this code block to a separate create transaction function
    const transaction = await this.transactionService.create({
      orderId: result.id,
      status: TransactionStatus.PENDING,
      amount: result.total,
      paymentMethod: result.paymentMethod,
    });
    if (!transaction) {
      await this.orderRepository.deleteOne({ _id: result.id });
      throw new InternalServerErrorException(
        'Cannot create order due to failure in transaction creation process',
      );
    }

    await this.removeCartDetails(userId, cartDetailIds);

    await this.increaseProductsSold(orderDetails);

    if (!deliveryAddressId) {
      await this.addDeliveryInformation(userId, deliveryInformation);
    }

    // TODO: Trigger VNPay payment if choosing VNPay options
    return result as Order;
  }

  async cancelOrder(orderId: string, claims: TokenPayloadDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ _id: orderId });
    if (claims.role === Role.CUSTOMER && order?.userId !== claims.sub) {
      throw new ForbiddenException('Customer only find their own orders');
    }
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const cancelableOrderStatus: OrderStatusEnum[] = [
      OrderStatusEnum.PENDING,
      OrderStatusEnum.PROCESSING,
    ];
    if (cancelableOrderStatus.findIndex((s) => s === order.status) !== -1) {
      throw new BadRequestException('Order cannot be canceled');
    }

    order.status = OrderStatusEnum.CANCELED;

    await this.transactionService.update(orderId, {
      status: TransactionStatus.CANCELED,
    } as UpdateTransactionDto);

    // TODO: perform other cancel order logic

    return await this.orderRepository.save(order);
  }

  async requestRefund(orderId: string, claims: TokenPayloadDto) {
    const order = await this.findOneById(orderId, claims);
    if (order.status !== OrderStatusEnum.COMPLETED) {
      throw new BadRequestException('Order must be completed to get refund');
    }
    order.status = OrderStatusEnum.REFUNDED;

    await this.transactionService.update(orderId, {
      status: TransactionStatus.REFUNDED,
    } as UpdateTransactionDto);

    // TODO: perform other logic for customer refunding process
    return this.orderRepository.save(order);
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatusEnum,
    claims: TokenPayloadDto,
  ): Promise<Order> {
    if (status === OrderStatusEnum.CANCELED) {
      return await this.cancelOrder(orderId, claims);
    }

    if (status === OrderStatusEnum.REFUNDED) {
      return await this.requestRefund(orderId, claims);
    }

    const order = await this.orderRepository.findOne({ _id: orderId });
    if (claims.role === Role.CUSTOMER && order?.userId !== claims.sub) {
      throw new ForbiddenException('Customer only find their own orders');
    }
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}
