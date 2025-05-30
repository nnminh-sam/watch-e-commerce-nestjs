import { FindCategoryDto } from './dto/find-category.dto';
import {
  Logger,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
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
import { CloudinaryService } from '@root/modules/cloudinary/cloudinary.service';
import { ResourceTypeEnum } from '@root/modules/cloudinary/enums/resource-type.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEnum } from '@root/modules/cloudinary/enums/event.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
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

  @OnEvent(EventEnum.UPLOAD_CATEGOTRY_ASSET_COMPLETED)
  private async presistAsset(payload: any) {
    const { resourceType, objectId, publicId, url } = payload;
    if (resourceType !== ResourceTypeEnum.CATEGORY_ASSET) {
      return;
    }

    const category = await this.categoryModel.findOne({ _id: objectId });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    category.assets.push(url);
    try {
      await category.save();
    } catch (error: any) {
      this.logger.fatal(error.message, CategoryService.name);
      throw new InternalServerErrorException(
        'Cannot update category asset',
        error.message,
      );
    }
  }

  async updateAssets(id: string, image: Express.Multer.File) {
    await this.cloudinaryService.uploadFile(
      image,
      ResourceTypeEnum.CATEGORY_ASSET,
      id,
    );

    return { message: 'Category asset uploaded successfully' };
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
