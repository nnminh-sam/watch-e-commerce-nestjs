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
import { ApiDocDetail } from '@root/commons/decorators/api-doc-detail.decorator';
import { ApiResponseWrapper } from '@root/commons/decorators/api-response-wrapper.decorator';
import { ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';

@ApiTags('Brands')
@UseGuards(JwtGuard)
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @ApiDocDetail({ summary: 'Create a new brand' })
  @ApiResponseWrapper(CreateBrandDto, 'brand', 'Brand created successfully')
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandService.create(createBrandDto);
  }

  @ApiDocDetail({ summary: 'Find brand by slug' })
  @ApiResponseWrapper(CreateBrandDto, 'brand', 'Brand details by slug')
  @Get('/slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.brandService.findOneBySlug(slug);
  }

  @ApiDocDetail({ summary: 'Find brands by name' })
  @ApiResponseWrapper(CreateBrandDto, 'brands', 'List of brands')
  @Get()
  async findByName(@Query('name') name: string) {
    return await this.brandService.findByName(name);
  }

  @ApiDocDetail({ summary: 'Find brand by ID' })
  @ApiResponseWrapper(CreateBrandDto, 'brand', 'Brand details by ID')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.brandService.findOne(id);
  }

  @ApiDocDetail({ summary: 'Update a brand' })
  @ApiResponseWrapper(UpdateBrandDto, 'brand', 'Brand updated successfully')
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return await this.brandService.update(id, updateBrandDto);
  }

  @ApiDocDetail({ summary: 'Delete a brand' })
  @ApiResponseWrapper(String, 'message', 'Brand deleted successfully')
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.brandService.delete(id);
  }
}
