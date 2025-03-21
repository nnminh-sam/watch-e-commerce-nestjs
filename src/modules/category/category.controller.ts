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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { Role } from '@root/models/enums/role.enum';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';

@UseGuards(JwtGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get('/slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findOneBySlug(slug);
  }

  @Get()
  async findByName(@Query('name') name: string) {
    return await this.categoryService.findByName(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(id);
  }

  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(id);
  }
}
