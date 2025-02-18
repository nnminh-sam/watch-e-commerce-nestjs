import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from '@root/brand/dto/create-brand.dto';
import { UpdateBrandDto } from '@root/brand/dto/update-brand.dto';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandService.create(createBrandDto);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.brandService.findOne(id);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return await this.brandService.update(id, updateBrandDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.brandService.delete(id);
  }
}
