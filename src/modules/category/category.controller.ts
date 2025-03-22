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
import { ApiDocDetail } from '@root/commons/decorators/api-doc-detail.decorator';
import { ApiResponseWrapper } from '@root/commons/decorators/api-response-wrapper.decorator';
import { ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { Role } from '@root/models/enums/role.enum';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';

@ApiTags('Categories')
@UseGuards(JwtGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiDocDetail({ summary: 'Create a new category' })
  @ApiResponseWrapper(
    CreateCategoryDto,
    'category',
    'Category created successfully',
  )
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @ApiDocDetail({ summary: 'Find category by slug' })
  @ApiResponseWrapper(CreateCategoryDto, 'category', 'Category details by slug')
  @Get('/slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findOneBySlug(slug);
  }

  @ApiDocDetail({ summary: 'Find categories by name' })
  @ApiResponseWrapper(CreateCategoryDto, 'categories', 'List of categories')
  @Get()
  async findByName(@Query('name') name: string) {
    return await this.categoryService.findByName(name);
  }

  @ApiDocDetail({ summary: 'Find category by ID' })
  @ApiResponseWrapper(CreateCategoryDto, 'category', 'Category details by ID')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(id);
  }

  @ApiDocDetail({ summary: 'Update a category' })
  @ApiResponseWrapper(
    UpdateCategoryDto,
    'category',
    'Category updated successfully',
  )
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @ApiDocDetail({ summary: 'Delete a category' })
  @ApiResponseWrapper(String, 'message', 'Category deleted successfully')
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(id);
  }
}
