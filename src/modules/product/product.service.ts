import { FindProductDto } from './dto/find-product.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  DetailedProduct,
  Product,
  ProductDocument,
} from '@root/models/product.model';
import { Model } from 'mongoose';
import { UpdateProductDto } from './dto/update-product.dto';
import { BrandService } from '@root/modules/brand/brand.service';
import { CategoryService } from '@root/modules/category/category.service';

@Injectable()
export class ProductService {
  private logger: Logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
  ) {}

  private async existBy(field: string, value: any): Promise<boolean> {
    return !!(await this.productModel.exists({ [field]: value }));
  }

  private async validateUniqueField(
    field: string,
    value: any,
    message: string,
  ): Promise<void> {
    if (await this.existBy(field, value)) {
      throw new BadRequestException(message);
    }
  }

  async create(createProductDto: CreateProductDto) {
    await this.validateUniqueField(
      'name',
      createProductDto.name,
      'Product name is already in use',
    );
    await this.validateUniqueField(
      'code',
      createProductDto.code,
      'Product code is already in use',
    );
    if (createProductDto.price < 0) {
      throw new BadRequestException('Price cannot be negative number');
    }
    if (createProductDto.stock < 0) {
      throw new BadRequestException('Stock cannot be negative number');
    }
    if (createProductDto?.sold && createProductDto?.sold < 0) {
      throw new BadRequestException('Product sold cannot be negative number');
    }
    const brand = await this.brandService.findOne(createProductDto.brand);
    const category = await this.categoryService.findOne(
      createProductDto.category,
    );

    try {
      const productModel = new this.productModel({
        ...createProductDto,
        brand,
        category,
        customerVisible: true,
      });
      const savedProductDocument = await productModel.save();
      return savedProductDocument.toJSON();
    } catch (error: any) {
      this.logger.error(`Error creating user: ${error.message}`);
      switch (error.name) {
        case 'ValidationError':
          throw new BadRequestException('User data validation failed');
        case 'CastError':
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Unable to create user');
      }
    }
  }

  async findDetailedProductById(id: string): Promise<DetailedProduct> {
    const product = await this.productModel
      .findOne(
        { _id: id },
        {
          customerVisible: 1,
          status: 1,
          spec: 1,
          assets: 1,
          comments: 1,
          totalComments: 1,
        },
      )
      .populate('brand category')
      .lean<DetailedProduct>();
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product;
  }

  async findOneById(id: string): Promise<Product> {
    const product = await this.productModel
      .findOne(
        { _id: id },
        {
          customerVisible: 1,
          status: 1,
          spec: 1,
          assets: 1,
          stock: 1,
          name: 1,
          code: 1,
          price: 1,
        },
      )
      .populate('brand category')
      .lean();
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product;
  }

  // TODO: Redesign this find product API with better filter and product details population
  async find(findProductDto: FindProductDto): Promise<Product[]> {
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

    const products = this.productModel
      .find(
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
      )
      .lean();

    return products;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.validateUniqueField(
      'name',
      updateProductDto.name,
      'Product name is already in use',
    );
    await this.validateUniqueField(
      'code',
      updateProductDto.code,
      'Product code is already in use',
    );
    if (updateProductDto.price < 0) {
      throw new BadRequestException('Price cannot be negative number');
    }
    if (updateProductDto.stock < 0) {
      throw new BadRequestException('Stock cannot be negative number');
    }
    if (updateProductDto?.sold && updateProductDto?.sold < 0) {
      throw new BadRequestException('Product sold cannot be negative number');
    }
    const brand = await this.brandService.findOne(updateProductDto.brand);
    const category = await this.categoryService.findOne(
      updateProductDto.category,
    );

    try {
      const product = await this.productModel
        .findOneAndUpdate(
          { _id: id },
          { $set: updateProductDto },
          { new: true },
        )
        .select('customerVisible status spec assets')
        .populate('category brand')
        .lean();

      if (!product) {
        throw new BadRequestException('Product not found');
      }

      return product;
    } catch (error: any) {
      this.logger.error(`Error creating user: ${error.message}`);
      switch (error.name) {
        case 'ValidationError':
          throw new BadRequestException('User data validation failed');
        case 'CastError':
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Unable to update user');
      }
    }
  }
}
