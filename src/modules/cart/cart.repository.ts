import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { executeWithErrorHandling } from '@root/database';
import { IGenericMongoRepository } from '@root/database/interfaces/generic-mongo-repository.interface';
import { Cart, CartDocument } from '@root/models/cart.model';
import { FilterQuery, Model, ProjectionType, QueryOptions } from 'mongoose';

// * Repository for Cart model [Repository Pattern]
@Injectable()
export class CartRepository
  implements IGenericMongoRepository<Cart, CartDocument>
{
  private logger: Logger = new Logger(CartRepository.name);

  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  find(): Promise<CartDocument[]> {
    throw new Error('Method is not allowed.');
  }

  async findOne(
    { userId }: FilterQuery<Cart>,
    projection?: ProjectionType<Cart>,
    options?: QueryOptions<Cart>,
  ): Promise<CartDocument | null> {
    try {
      return await this.cartModel.findOne<CartDocument>(
        { userId },
        projection,
        options,
      );
    } catch (error: any) {
      console.log('🚀 ~ Cart Repo Find one error:', error);
      this.logger.error('Cart not found');
      return null;
    }
    // return executeWithErrorHandling({
    //   fn: async () =>

    //   logSystem: this.logger,
    // });
  }

  async create(userId: string) {
    const cartDocuemnt = new this.cartModel({
      userId,
      total: 0,
      details: [],
    });
    return await this.save(cartDocuemnt);
  }

  async save(document: CartDocument): Promise<CartDocument> {
    return executeWithErrorHandling({
      fn: async () => {
        const result = await document.save();
        return result.toJSON();
      },
      logSystem: this.logger,
    });
  }
}
