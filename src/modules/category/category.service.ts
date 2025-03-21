import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from '@root/models/category.model';
import { Model } from 'mongoose';
import { generateSlug } from '@root/utils';

@Injectable()
export class CategoryService {
  private logger: Logger = new Logger(CategoryService.name);

  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const categorySlug: string = createCategoryDto.slug
        ? createCategoryDto.slug
        : generateSlug(createCategoryDto.name);
      const categoryModel = new this.categoryModel({
        ...createCategoryDto,
        slug: categorySlug,
        isFeatured: createCategoryDto.isFeatured || false,
      });
      const savedCategoryDocument = await categoryModel.save();
      return savedCategoryDocument.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot create category');
    }
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findOne(
      {
        _id: id,
        deletedAt: null,
      },
      {
        deletedAt: 0,
      },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category.toJSON();
  }

  async findOneBySlug(slug: string) {
    const category = await this.categoryModel.findOne(
      {
        slug,
        deletedAt: null,
      },
      {
        deletedAt: 0,
      },
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category.toJSON();
  }

  async findByName(name: string) {
    const categories = await this.categoryModel.find(
      {
        $text: {
          $search: name,
        },
        deletedAt: null,
      },
      {
        deletedAt: 0,
      },
    );
    if (!categories) {
      throw new NotFoundException('Categories not found');
    }
    return categories;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const updatedCategory = await this.categoryModel.findOneAndUpdate(
        { _id: id, deletedAt: null },
        updateCategoryDto,
        { new: true },
      );

      if (!updatedCategory) {
        throw new NotFoundException('Category not found');
      }

      return updatedCategory.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot update category');
    }
  }

  async remove(id: string) {
    try {
      const deletedCategory = await this.categoryModel.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true },
      );

      if (!deletedCategory) {
        throw new NotFoundException('Category not found');
      }

      return deletedCategory.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot delete category');
    }
  }
}
