import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CartDetail } from '@root/models/cart-detail.model';
import { Cart } from '@root/models/cart.model';
import { DeliveryInformation } from '@root/models/delivery-information.model';
import { OrderStatusEnum } from '@root/models/enums/order-status.enum';
import { OrderDetail } from '@root/models/order-detail.model';
import { Order, OrderDocument } from '@root/models/order.model';
import { CartService } from '@root/modules/cart/cart.service';
import { CreateOrderDto } from '@root/modules/order/dto/create-order.dto';
import { FindOrderDto } from '@root/modules/order/dto/find-order.dto';
import { OrderRepository } from '@root/modules/order/order.repository';
import { ProductService } from '@root/modules/product/product.service';
import { CreateDeliveryInformationDto } from '@root/modules/user/dto/create-delivery-information.dto';
import { UserService } from '@root/modules/user/user.service';
import { date } from 'joi';
import { Model } from 'mongoose';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
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
    Promise.all([
      cartDetailIds.forEach(async (detailId: string) => {
        const result = await this.cartService.deleteCartDetail(
          userId,
          detailId,
        );
        if (!result) {
          throw new BadRequestException('Cannot remove product out of cart');
        }
      }),
    ]);
  }

  /**
   * ! Currently, this will insert a delivery information straight into the user schema without checking existed delivery information
   *
   * @param userId
   * @param createDeliveryInformationDto
   * @returns
   */
  private async addDeliveryInformation(
    userId: string,
    createDeliveryInformationDto: CreateDeliveryInformationDto,
  ) {
    await this.userService.createDeliveryInformation(
      userId,
      createDeliveryInformationDto,
    );
    return true;
  }

  async findOneById(userId: string, id: string) {
    const order = await this.orderRepository.findOne(
      { _id: id, userId },
      {},
      { lean: true },
    );
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async find(findOrderDto: FindOrderDto, userId: string) {
    const {
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
      userId,
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
    const { cartDetailIds, paymentMethod, ...rest } = createOrderDto;
    const cart = await this.cartService.findOneByUserId(userId);
    const orderDetails: OrderDetail[] = this.createOrderDetails(
      cart,
      createOrderDto.cartDetailIds,
    );

    const orderNumber: string = `${Date.now()}`;
    const deliveryInformation = { ...rest } as DeliveryInformation;
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

    await this.removeCartDetails(userId, cartDetailIds);

    await this.increaseProductsSold(orderDetails);

    await this.addDeliveryInformation(userId, {
      ...rest,
    } as CreateDeliveryInformationDto);

    // TODO: Trigger VNPay payment if choosing VNPay options
    return result as Order;
  }

  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.findOneById(userId, orderId);
    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }
    order.status = OrderStatusEnum.CANCELED;
    return this.orderRepository.save(order as OrderDocument);
  }

  async updateOrderStatus(
    userId: string,
    orderId: string,
    status: OrderStatusEnum,
  ): Promise<Order> {
    const order = await this.findOneById(userId, orderId);
    order.status = status;
    return this.orderRepository.save(order as OrderDocument);
  }
}
