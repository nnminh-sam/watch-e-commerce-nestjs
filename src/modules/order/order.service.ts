import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '@root/models/order.model';
import { Model } from 'mongoose';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create() {
    
  }
}
