import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { EnvironmentService } from '@root/environment/environment.service';
import Redis from 'ioredis';

@Injectable()
export class RedisCartService implements OnModuleInit {
  private readonly logger: Logger = new Logger(RedisCartService.name);
  private readonly redisCart: Redis;

  constructor(private readonly environmentService: EnvironmentService) {
    this.redisCart = new Redis({
      host: this.environmentService.redisHost,
      port: this.environmentService.redisPort,
      db: this.environmentService.redisDbCart,
    });
  }

  async onModuleInit() {
    try {
      const connectionResult = await this.redisCart.ping();
      if (connectionResult !== 'PONG') {
        this.logger.error(`Cannot connect to Redis Shopping Cart DB`);
      } else {
        this.logger.log(`Connected to Redis Shopping Cart DB`);
      }
    } catch (error: any) {
      this.logger.error(`Cannot connect to Redis server: ${error.message}`);
      return false;
    }
  }

  async getAllProducts(userId: string) {
    const key: string = `cart:${userId}`;
    return await this.redisCart.hgetall(key);
  }

  async addProduct(userId: string, productId: string, value: string) {
    const key: string = `cart:${userId}`;
    const field: string = `product:${productId}`;

    try {
      await this.redisCart.hset(key, field, value);
    } catch (error: any) {
      throw new InternalServerErrorException('Cannot add product into cart');
    }
  }

  async updateProduct(userId: string, productId: string, value: string) {
    const key: string = `cart:${userId}`;
    const field: string = `product:${productId}`;
    const productExisted = await this.redisCart.hexists(key, field);
    if (!productExisted) {
      throw new BadGatewayException('Product not found in cart');
    }
    return await this.addProduct(userId, productId, value);
  }

  async removeProduct(userId: string, productId: string) {
    const key: string = `cart:${userId}`;
    const field: string = `product:${productId}`;
    const productExisted = await this.redisCart.hexists(key, field);
    if (!productExisted) {
      throw new BadGatewayException('Product not found in cart');
    }
    try {
      await this.redisCart.hdel(key, field);
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Cannot remove product out of cart',
      );
    }
  }
}
