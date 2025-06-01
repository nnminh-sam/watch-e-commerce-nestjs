import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { executeWithErrorHandling } from '@root/database';
import { IGenericMongoRepository } from '@root/database/interfaces/generic-mongo-repository.interface';
import { Order, OrderDocument } from '@root/models/order.model';
import { FilterQuery, Model, ProjectionType, QueryOptions } from 'mongoose';

// * Repository for Order model [Repository Pattern]
@Injectable()
export class OrderRepository
  implements IGenericMongoRepository<Order, OrderDocument>
{
  private readonly logger: Logger = new Logger(OrderRepository.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  find(
    filters?: FilterQuery<Order> | undefined,
    projection?: ProjectionType<Order> | undefined,
    options?: QueryOptions<Order> | undefined,
  ): Promise<OrderDocument[]> {
    return executeWithErrorHandling({
      fn: async () => {
        return this.orderModel.find({ ...filters }, projection, options);
      },
      logSystem: this.logger,
    });
  }

  findOne(
    filters: FilterQuery<Order>,
    projection?: ProjectionType<Order> | undefined,
    options?: QueryOptions<Order> | undefined,
  ): Promise<OrderDocument | null> {
    return executeWithErrorHandling({
      fn: async () => {
        return this.orderModel.findOne(filters, projection, options);
      },
      logSystem: this.logger,
    });
  }

  createDocument(order: Order) {
    return new this.orderModel({
      ...order,
    }) as OrderDocument;
  }

  save(document: OrderDocument): Promise<OrderDocument> {
    return executeWithErrorHandling({
      fn: async () => {
        const result = await document.save();
        return result.toJSON();
      },
      logSystem: this.logger,
    });
  }

  deleteOne(
    filter: FilterQuery<Order>,
    options?: QueryOptions<Order> | undefined,
  ): Promise<boolean> {
    return executeWithErrorHandling({
      fn: async () => {
        return await this.orderModel.findOneAndDelete(filter, options);
      },
      logSystem: this.logger,
    });
  }
}
