import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '@root/models/order.model';
import { CartModule } from '@root/modules/cart/cart.module';
import { OrderController } from '@root/modules/order/order.controller';
import { OrderRepository } from '@root/modules/order/order.repository';
import { OrderService } from '@root/modules/order/order.service';
import { ProductModule } from '@root/modules/product/product.module';
import { TransactionModule } from '@root/modules/transaction/transaction.module';
import { UserModule } from '@root/modules/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
    CartModule,
    ProductModule,
    UserModule,
    TransactionModule,
  ],
  providers: [OrderService, OrderRepository],
  controllers: [OrderController],
})
export class OrderModule {}
