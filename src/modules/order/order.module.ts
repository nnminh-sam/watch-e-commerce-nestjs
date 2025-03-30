import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '@root/models/order.model';
import { OrderController } from '@root/modules/order/order.controller';
import { OrderService } from '@root/modules/order/order.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
