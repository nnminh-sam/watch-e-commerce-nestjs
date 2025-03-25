import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { Brand } from '@root/models/brand.model';
import { FindBrandDto } from '@root/modules/brand/dto/find-brand.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @ApiOperation({ summary: 'Create a new brand' })
  @SuccessApiResponse({
    model: Brand,
    key: 'brand',
    description: 'Brand created successfully',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Brand name has been taken',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandService.create(createBrandDto);
  }

  @ApiOperation({ summary: 'Find brand by slug' })
  @SuccessApiResponse({
    model: Brand,
    key: 'brand',
    description: 'Brand details by slug',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @Get('/slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.brandService.findOneBy('slug', slug);
  }

  @ApiOperation({ summary: 'Find brands' })
  @SuccessApiResponse({
    model: Brand,
    key: 'brands',
    description: 'List of brands',
    isArray: true,
  })
  @Get()
  async find(@Query() findBrandDto: FindBrandDto) {
    return await this.brandService.find(findBrandDto);
  }

  @ApiOperation({ summary: 'Find brand by ID' })
  @SuccessApiResponse({
    model: Brand,
    key: 'brand',
    description: 'Brand details by ID',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.brandService.findOneBy('_id', id);
  }

  @ApiOperation({ summary: 'Update a brand' })
  @SuccessApiResponse({
    model: Brand,
    key: 'brand',
    description: 'Brand updated successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Brand name has been taken',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return await this.brandService.update(id, updateBrandDto);
  }

  @ApiOperation({ summary: 'Delete a brand' })
  @SuccessApiResponse({
    description: 'Brand deleted successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.brandService.delete(id);
  }
}
