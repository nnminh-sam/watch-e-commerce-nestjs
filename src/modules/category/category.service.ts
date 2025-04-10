import { FindCategoryDto } from './dto/find-category.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from '@root/models/category.model';
import { Model } from 'mongoose';
import { generateSlug } from '@root/utils';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaginationResponseDto } from '@root/commons/dtos/pagination-response.dto';
import { GenericApiResponseDto } from '@root/commons/dtos/generic-api-response.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,

    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const slug: string = createCategoryDto.slug
        ? createCategoryDto.slug
        : generateSlug(createCategoryDto.name);
      const categoryModel = new this.categoryModel({
        ...createCategoryDto,
        slug,
        isFeatured: createCategoryDto.isFeatured || false,
      });
      const savedCategoryDocument = await categoryModel.save();
      return savedCategoryDocument.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot create category');
    }
  }

  async findOneBy(key: string, value: string): Promise<Category> {
    if (key === 'id') {
      key = '_id';
    }
    const category = await this.categoryModel
      .findOne({
        [key]: value,
        deletedAt: null,
      })
      .select('-deletedAt')
      .lean();
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async find(
    findCategoryDto: FindCategoryDto,
  ): Promise<GenericApiResponseDto<Category[]>> {
    const { name, page, size, sortBy, orderBy } = findCategoryDto;
    const skip: number = (page - 1) * size;
    const filter: any = { deletedAt: null };
    if (name) {
      filter.$text = { $search: name };
    }

    const [result] = await this.categoryModel.aggregate([
      { $match: filter },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          categories: [
            { $sort: { [sortBy]: orderBy === 'asc' ? 1 : -1 } },
            { $skip: skip },
            { $limit: size },
          ],
        },
      },
    ]);

    const categories: Category[] = result.categories.map((category: any) =>
      Category.transform(category),
    );

    const total = result.metadata[0]?.total || 0;
    const pagination: PaginationResponseDto = {
      total,
      page,
      perPage: size,
      totalPages: Math.ceil(total / size),
    };

    return new GenericApiResponseDto<Category[]>(categories, pagination);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      const updatedCategory = await this.categoryModel
        .findOneAndUpdate({ _id: id, deletedAt: null }, updateCategoryDto, {
          new: true,
        })
        .lean();
      if (!updatedCategory) {
        throw new NotFoundException('Category not found');
      }

      return updatedCategory;
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot update category');
    }
  }

  async remove(id: string): Promise<Category> {
    try {
      const deletedCategory = await this.categoryModel
        .findOneAndUpdate(
          { _id: id, deletedAt: null },
          { deletedAt: new Date() },
          { new: true },
        )
        .lean();
      if (!deletedCategory) {
        throw new NotFoundException('Category not found');
      }

      return deletedCategory;
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot delete category');
    }
  }
}
