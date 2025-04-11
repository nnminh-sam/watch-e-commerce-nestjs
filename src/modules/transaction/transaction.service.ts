import { FindTransactionDto } from './dto/find-transaction.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GenericApiResponseDto } from '@root/commons/dtos/generic-api-response.dto';
import { PaginationResponseDto } from '@root/commons/dtos/pagination-response.dto';
import { Transaction } from '@root/models/transaction.model';
import { TokenPayloadDto } from '@root/modules/auth/dtos/token-payload.dto';
import { CreateTransactionDto } from '@root/modules/transaction/dto/create-transaction.dto';
import { UpdateTransactionDto } from '@root/modules/transaction/dto/update-transaction.dto';
import { TransactionRepository } from '@root/modules/transaction/transaction.repository';
import { PipelineStage } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const document =
      this.transactionRepository.createDocument(createTransactionDto);
    return await this.transactionRepository.save(document);
  }

  async findOneById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne(
      { _id: id },
      {},
      { lean: true },
    );
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findOneByOrderId(orderId: string) {
    const transaction = await this.transactionRepository.findOne({ orderId });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async find(findTransactionDto: FindTransactionDto) {
    const {
      page,
      size,
      orderBy,
      sortBy,
      userId,
      minAmount,
      maxAmount,
      ...rest
    } = findTransactionDto;
    const skip: number = (page - 1) * size;

    const amountFilters = {
      $and: [
        ...(minAmount ? [{ amount: { $gte: minAmount } }] : []),
        ...(maxAmount ? [{ amount: { $lte: maxAmount } }] : []),
      ],
    };
    const filters = {
      'order.userId': userId,
      ...rest,
      ...amountFilters,
    };

    const pipeline: PipelineStage[] = [
      { $match: filters },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          transactions: [
            { $sort: { [sortBy]: orderBy === 'asc' ? 1 : -1 } },
            { $skip: skip },
            { $limit: size },
            { $project: { orderId: 1 } },
          ],
        },
      },
    ];

    const [result] = await this.transactionRepository.aggregate(pipeline);
    const transactions: Transaction[] = result.transactions.map(
      (transaction: any) => Transaction.transform(transaction),
    );
    const total = result.metadata[0]?.total || 0;
    const pagination: PaginationResponseDto = {
      total,
      page,
      perPage: size,
      totalPages: Math.ceil(total / size),
    };
    return new GenericApiResponseDto<Transaction[]>(transactions, pagination);
  }

  async update(
    orderId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const { status, paymentMethod } = updateTransactionDto;
    const transaction = await this.transactionRepository.findOne({ orderId });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (status) {
      transaction.status = status;
    }
    if (paymentMethod) {
      transaction.paymentMethod = paymentMethod;
    }

    return await this.transactionRepository.save(transaction);
  }
}
