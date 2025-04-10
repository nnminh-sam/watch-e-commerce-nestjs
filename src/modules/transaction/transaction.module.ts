import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from '@root/models/transaction.model';
import { OrderModule } from '@root/modules/order/order.module';
import { TransactionController } from '@root/modules/transaction/transaction.controller';
import { TransactionRepository } from '@root/modules/transaction/transaction.repository';
import { TransactionService } from '@root/modules/transaction/transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { schema: TransactionSchema, name: Transaction.name },
    ]),
  ],
  providers: [TransactionService, TransactionRepository],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
