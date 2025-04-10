import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { executeWithErrorHandling } from '@root/database';
import { IGenericMongoRepository } from '@root/database/interfaces/generic-mongo-repository.interface';
import {
  Transaction,
  TransactionDocument,
} from '@root/models/transaction.model';
import { CreateTransactionDto } from '@root/modules/transaction/dto/create-transaction.dto';
import {
  Aggregate,
  AggregateOptions,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class TransactionRepository
  implements IGenericMongoRepository<Transaction, TransactionDocument>
{
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,

    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  aggregate(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
  ): Promise<Aggregate<any[]>> {
    return executeWithErrorHandling({
      fn: async () => {
        return await this.transactionModel.aggregate(pipeline, options);
      },
      logSystem: this.logger,
    });
  }

  findOne(
    filters: FilterQuery<Transaction>,
    projection?: ProjectionType<Transaction> | undefined,
    options?: QueryOptions<Transaction> | undefined,
  ): Promise<TransactionDocument | null> {
    return executeWithErrorHandling({
      fn: async () => {
        return this.transactionModel.findOne(filters, projection, options);
      },
      logSystem: this.logger,
    });
  }

  createDocument(createTransactionDto: CreateTransactionDto) {
    return new this.transactionModel(createTransactionDto);
  }

  save(document: TransactionDocument): Promise<TransactionDocument> {
    return executeWithErrorHandling({
      fn: async () => {
        const result = await document.save();
        return result.toJSON();
      },
      logSystem: this.logger,
    });
  }
}
