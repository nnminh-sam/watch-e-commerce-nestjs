import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from '@root/models/cart.model';
import { DatabaseModule } from '@root/database/database.module';
import { CartController } from './cart.controller';
import { ProductModule } from '@root/modules/product/product.module';
import { CartRepository } from '@root/modules/cart/cart.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Cart.name,
        schema: CartSchema,
      },
    ]),
    DatabaseModule,
    ProductModule,
  ],
  providers: [CartService, CartRepository],
  exports: [CartService],
  controllers: [CartController],
})
export class CartModule {}
