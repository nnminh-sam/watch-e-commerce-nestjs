import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { Role } from '@root/models/enums/role.enum';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';

@ApiTags('Categories')
@UseGuards(JwtGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @SuccessApiResponse({
    model: CreateCategoryDto,
    key: 'category',
    description: 'Category created successfully',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Category name has been taken',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Find category by slug' })
  @SuccessApiResponse({
    model: CreateCategoryDto,
    key: 'category',
    description: 'Category details by slug',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @Get('/slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findOneBySlug(slug);
  }

  @ApiOperation({ summary: 'Find categories by name' })
  @SuccessApiResponse({
    model: CreateCategoryDto,
    key: 'categories',
    description: 'List of categories',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @Get()
  async findByName(@Query('name') name: string) {
    return await this.categoryService.findByName(name);
  }

  @ApiOperation({ summary: 'Find category by ID' })
  @SuccessApiResponse({
    model: CreateCategoryDto,
    key: 'category',
    description: 'Category details by ID',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a category' })
  @SuccessApiResponse({
    model: UpdateCategoryDto,
    key: 'category',
    description: 'Category updated successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Category name has been taken',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'Forbidden request',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete a category' })
  @SuccessApiResponse({
    description: 'Category deleted successfully',
    messageKeyExample: 'Category removed',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(id);
  }
}
