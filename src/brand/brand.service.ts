import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBrandDto } from '@root/brand/dto/create-brand.dto';
import { UpdateBrandDto } from '@root/brand/dto/update-brand.dto';
import { Brand, BrandDocument } from '@root/brand/entities/brand.model';
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
      const brandModel = new this.brandModel(createBrandDto);
      const brandDocument = await brandModel.save();
      return (await brandDocument).toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot create new brand');
    }
  }

  async findOne(brandId: string) {
    const brand = await this.brandModel.findOne({
      _id: brandId,
      deletedAt: null,
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand.toJSON();
  }

  async update(brandId: string, updateBrandDto: UpdateBrandDto) {
    try {
      const updatedBrand = await this.brandModel.findOneAndUpdate(
        { _id: brandId, deletedAt: null },
        updateBrandDto,
        { new: true },
      );

      if (!updatedBrand) {
        throw new BadRequestException('Brand not found');
      }

      return updatedBrand.toJSON();
    } catch (error: any) {
      this.logger.error(error.message);
      throw new BadRequestException('Cannot update brand');
    }
  }

  async delete(brandId: string) {
    try {
      const deletedBrand = await this.brandModel.findOneAndUpdate(
        { _id: brandId, deletedAt: null },
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
