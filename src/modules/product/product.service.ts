import { FindProductDto } from './dto/find-product.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '@root/models/product.model';
import { Model } from 'mongoose';
import { UpdateProductDto } from './dto/update-product.dto';
import { BrandService } from '@root/modules/brand/brand.service';
import { CategoryService } from '@root/modules/category/category.service';
import { Spec } from '@root/models/spec.model';
import { Brand } from '@root/models/brand.model';
import { Category } from '@root/models/category.model';

@Injectable()
export class ProductService {
  private logger: Logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
  ) {}

  private getTextSearchFilter(name?: string) {
    return name ? { $text: { $search: name } } : {};
  }

  private getIncludeSearchFilter(sku?: string) {
    return sku ? { sku: { $regex: sku, $options: 'i' } } : {};
  }

  private getPriceFilter(minPrice?: number, maxPrice?: number) {
    const priceFilters: any[] = [
      ...(minPrice ? [{ price: { $gte: minPrice } }] : []),
      ...(maxPrice ? [{ price: { $lte: maxPrice } }] : []),
    ];
    if (priceFilters.length > 0) {
      return { $and: priceFilters };
    }

    return {};
  }

  private getBrandFilter(brand?: string, brandId?: string) {
    const brandFilters: any[] = [
      ...(brand ? [{ 'brand.name': { $regex: brand, $options: 'i' } }] : []),
      ...(brandId ? [{ 'brand._id': brandId }] : []),
    ];
    return brandFilters.length > 0 ? { $or: brandFilters } : {};
  }

  private getCategoryFilter(category?: string, categoryId?: string) {
    const categoryFilters: any[] = [
      ...(category
        ? [{ 'category.name': { $regex: category, $options: 'i' } }]
        : []),
      ...(categoryId ? [{ 'category._id': categoryId }] : []),
    ];
    return categoryFilters.length > 0 ? { $or: categoryFilters } : {};
  }

  private getSpecFilter(specIds?: string[]) {
    return specIds && specIds.length
      ? { $and: specIds.map((id) => ({ 'specs._id': id })) }
      : {};
  }

  async find(findProductDto: FindProductDto): Promise<Product[]> {
    const {
      page,
      size,
      sortBy,
      orderBy,
      name,
      sku,
      spu,
      minPrice,
      maxPrice,
      brand,
      brandId,
      category,
      categoryId,
      specIds,
    } = findProductDto;

    const skip: number = (page - 1) * size;

    const filters = {
      ...this.getTextSearchFilter(name),
      ...this.getIncludeSearchFilter(sku),
      ...this.getPriceFilter(minPrice, maxPrice),
      ...this.getBrandFilter(brand, brandId),
      ...this.getCategoryFilter(category, categoryId),
      ...this.getSpecFilter(specIds),
      ...(spu && { spu }),
      customerVisible: true,
    };

    return await this.productModel
      .find(filters)
      .select('-comments -totalComment')
      .sort({ [sortBy]: orderBy })
      .skip(skip)
      .limit(size)
      .lean();
  }

  async findOneById(id: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ _id: id })
      .select('-comments -totalComment')
      .lean();
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product;
  }

  async findProductSpecifications(): Promise<Spec[]> {
    const products: Product[] = await this.productModel
      .find({ customerVisible: true }, { specs: 1 })
      .lean();

    const specificationSet: Record<string, Spec> = {};
    products.forEach((product: Product) => {
      product.specs.forEach((spec: Spec) => {
        if (!specificationSet[spec.id]) {
          specificationSet[spec.id] = spec;
        }
      });
    });
    return Object.values(specificationSet);
  }

  private async validateUniqueField(
    field: string,
    value: any,
    message: string,
    exceptId?: string,
  ): Promise<void> {
    const result = await this.productModel
      .exists({
        [field]: value,
        ...(exceptId && { _id: exceptId }),
      })
      .lean();
    if (result) {
      throw new BadRequestException(message);
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    await this.validateUniqueField(
      'name',
      createProductDto.name,
      'Product name is already in use',
    );
    await this.validateUniqueField(
      'sku',
      createProductDto.sku,
      'Product SKU is already in use',
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
    const brand = await this.brandService.findOneBy(
      'id',
      createProductDto.brandId,
    );
    const category = await this.categoryService.findOneBy(
      'id',
      createProductDto.categoryId,
    );

    const specs: Spec[] = createProductDto?.specs
      ? await Promise.all(
          createProductDto.specs.map(async (spec: Spec) => {
            const existingSpec = await this.productModel.findOne(
              { 'specs.key': spec.key, 'specs.value': spec.value },
              { 'specs.$': 1 },
            );

            return existingSpec ? existingSpec.specs[0] : spec;
          }),
        )
      : [];

    try {
      const productModel = new this.productModel({
        ...createProductDto,
        specs,
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

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productModel.findOne({ _id: id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.validateUniqueField(
      'name',
      updateProductDto.name,
      'Product name is already in use',
      id,
    );
    await this.validateUniqueField(
      'sku',
      updateProductDto.sku,
      'Product SKU is already in use',
      id,
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
    const brand: Brand = await this.brandService.findOneBy(
      'id',
      updateProductDto.brandId,
    );
    if (brand.id !== product.brand.id) {
      product.brand = brand;
    }
    const category: Category = await this.categoryService.findOneBy(
      'id',
      updateProductDto.categoryId,
    );
    if (category.id !== product.category.id) {
      product.category = category;
    }

    try {
      return await product.updateOne(updateProductDto);
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
