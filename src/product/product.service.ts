import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '@root/product/entities/product.entity';
import { Model } from 'mongoose';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private logger: Logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const productModel = new this.productModel({
        ...createProductDto,
        customerVisible: true,
      });
      const savedProductDocument = await productModel.save();
      return savedProductDocument.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot create product');
    }
  }

  async findOne(id: string) {
    const product = await this.productModel.findOne({
      _id: id,
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product.toJSON();
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const updatedProduct = await this.productModel.findOneAndUpdate(
        { _id: id },
        updateProductDto,
        { new: true },
      );

      if (!updatedProduct) {
        throw new BadRequestException('Product not found');
      }

      return updatedProduct.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot update product');
    }
  }
}
