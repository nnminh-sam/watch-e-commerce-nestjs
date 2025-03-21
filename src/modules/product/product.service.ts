import { FindProductDto } from './dto/find-product.dto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '@root/models/product.model';
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
    const product = await this.productModel
      .findOne(
        { _id: id },
        {
          comments: 1,
          totalComments: 1,
          spec: 1,
          assets: 1,
        },
      )
      .populate('brand category');

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product.toJSON();
  }

  async find(findProductDto: FindProductDto) {
    const searchTerms: string[] = [];
    if (findProductDto?.name) searchTerms.push(findProductDto.name);

    const textSearchQuery =
      searchTerms.length <= 0
        ? {}
        : { $text: { $search: searchTerms.join(' ') } };

    const priceQuery = {
      $and: [
        {
          ...(findProductDto?.minPrice && {
            price: { $gte: findProductDto?.minPrice },
          }),
        },
        {
          ...(findProductDto?.maxPrice && {
            price: { $lte: findProductDto?.maxPrice },
          }),
        },
      ],
    };

    const products = this.productModel.find(
      {
        ...textSearchQuery,
        ...priceQuery,
        ...(findProductDto?.code && { code: findProductDto.code }),
        ...(findProductDto?.brand && { code: findProductDto.brand }),
        ...(findProductDto?.category && { code: findProductDto.category }),
      },
      {
        comments: 0,
        totalComments: 0,
        spec: 0,
        description: 0,
      },
    );

    return products;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const updatedProduct = await this.productModel
        .findOneAndUpdate({ _id: id }, updateProductDto, { new: true })
        .populate('category brand');

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
