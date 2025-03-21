import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand, BrandDocument } from '@root/models/brand.model';
import { CreateBrandDto } from '@root/modules/brand/dto/create-brand.dto';
import { UpdateBrandDto } from '@root/modules/brand/dto/update-brand.dto';
import { generateSlug } from '@root/utils';
import { Model } from 'mongoose';

@Injectable()
export class BrandService {
  private logger = new Logger(BrandService.name);

  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    try {
      const brandSlug: string = createBrandDto.slug
        ? createBrandDto.slug
        : generateSlug(createBrandDto.name);
      const brandModel = new this.brandModel({
        ...createBrandDto,
        slug: brandSlug,
      });
      const brandDocument = await brandModel.save();
      return brandDocument.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot create new brand');
    }
  }

  async findOne(id: string) {
    const brand = await this.brandModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .select('-deletedAt');

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand.toJSON();
  }

  async findOneBySlug(slug: string) {
    const brand = await this.brandModel.findOne(
      {
        slug,
        deletedAt: null,
      },
      {
        deletedAt: 0,
      },
    );
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand.toJSON();
  }

  async findByName(name: string) {
    const brands = await this.brandModel.find(
      {
        $text: {
          $search: name,
        },
        deletedAt: null,
      },
      { deletedAt: 0 },
    );
    if (!brands) {
      throw new NotFoundException('Brands not found');
    }

    return brands;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    try {
      const updatedBrand = await this.brandModel
        .findOneAndUpdate({ _id: id, deletedAt: null }, updateBrandDto, {
          new: true,
        })
        .select('-deletedAt');

      if (!updatedBrand) {
        throw new BadRequestException('Brand not found');
      }

      return updatedBrand.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot update brand');
    }
  }

  async delete(id: string) {
    try {
      const deletedBrand = await this.brandModel.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: Date.now() },
        { new: true },
      );

      if (!deletedBrand) {
        throw new BadRequestException('Brand not found');
      }

      return deletedBrand.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot delete brand');
    }
  }
}
