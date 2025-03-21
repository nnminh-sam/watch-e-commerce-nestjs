import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { CreateBrandDto } from '@root/modules/brand/dto/create-brand.dto';
import { UpdateBrandDto } from '@root/modules/brand/dto/update-brand.dto';

@UseGuards(JwtGuard)
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandService.create(createBrandDto);
  }

  @Get('/slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.brandService.findOneBySlug(slug);
  }

  @Get()
  async findByName(@Query('name') name: string) {
    return await this.brandService.findByName(name);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.brandService.findOne(id);
  }

  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return await this.brandService.update(id, updateBrandDto);
  }

  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.brandService.delete(id);
  }
}
