import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GenericApiResponseDto } from '@root/commons/dtos/generic-api-response.dto';
import { PaginationResponseDto } from '@root/commons/dtos/pagination-response.dto';
import { Brand, BrandDocument } from '@root/models/brand.model';
import { CreateBrandDto } from '@root/modules/brand/dto/create-brand.dto';
import { FindBrandDto } from '@root/modules/brand/dto/find-brand.dto';
import { UpdateBrandDto } from '@root/modules/brand/dto/update-brand.dto';
import { generateSlug } from '@root/utils';
import { Model } from 'mongoose';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    try {
      const slug: string = createBrandDto.slug
        ? createBrandDto.slug
        : generateSlug(createBrandDto.name);
      const brandModel = new this.brandModel({ ...createBrandDto, slug });
      const brandDocument = await brandModel.save();
      return brandDocument.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot create new brand');
    }
  }

  async findOneBy(key: string, value: string): Promise<Brand> {
    if (key === 'id') {
      key = '_id';
    }
    const brand = await this.brandModel
      .findOne({
        [key]: value,
        deletedAt: null,
      })
      .lean();
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async find(
    findBrandDto: FindBrandDto,
  ): Promise<GenericApiResponseDto<Brand[]>> {
    const { name, page, size, orderBy, sortBy } = findBrandDto;
    const skip: number = (page - 1) * size;
    const filter: any = { deletedAt: null };
    if (name) {
      filter.$text = { $search: name };
    }

    const [result] = await this.brandModel.aggregate([
      { $match: filter },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          brands: [
            { $sort: { [sortBy]: orderBy === 'asc' ? 1 : -1 } },
            { $skip: skip },
            { $limit: size },
          ],
        },
      },
    ]);
    const formattedResult: Brand[] = result.brands.map((brand: any) =>
      Brand.transform(brand),
    );

    const total = result.metadata[0]?.total || 0;
    const pagination: PaginationResponseDto = {
      total,
      page,
      perPage: size,
      totalPages: Math.ceil(total / size),
    };

    return new GenericApiResponseDto<Brand[]>(formattedResult, pagination);
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    try {
      const updatedBrand = await this.brandModel
        .findOneAndUpdate({ _id: id, deletedAt: null }, updateBrandDto, {
          new: true,
        })
        .lean();
      if (!updatedBrand) {
        throw new BadRequestException('Brand not found');
      }

      return updatedBrand;
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot update brand');
    }
  }

  async delete(id: string): Promise<string> {
    try {
      const deletedBrand = await this.brandModel
        .findOneAndUpdate(
          { _id: id, deletedAt: null },
          { deletedAt: Date.now() },
          { new: true },
        )
        .lean();
      if (!deletedBrand) {
        throw new BadRequestException('Brand not found');
      }

      return 'Brand deleted successfully';
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot delete brand');
    }
  }
}
