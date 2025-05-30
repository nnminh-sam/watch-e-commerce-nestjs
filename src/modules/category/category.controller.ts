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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { Role } from '@root/models/enums/role.enum';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { Category } from '@root/models/category.model';
import { FindCategoryDto } from '@root/modules/category/dto/find-category.dto';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ProtectedApi({
    summary: 'Create a new category',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    model: Category,
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
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Find category by slug' })
  @SuccessApiResponse({
    model: Category,
    key: 'category',
    description: 'Category details by slug',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @Get('/slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findOneBy('slug', slug);
  }

  @ApiOperation({ summary: 'Find categories' })
  @SuccessApiResponse({
    model: Category,
    key: 'categories',
    description: 'List of categories',
    isArray: true,
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @Get()
  async find(@Query() findCategoryDto: FindCategoryDto) {
    return await this.categoryService.find(findCategoryDto);
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
    return await this.categoryService.findOneBy('id', id);
  }

  @ProtectedApi({
    summary: 'Update a category',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
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
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Update category asset' })
  @SuccessApiResponse({
    description: 'Category asset updated successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Cannot update category asset',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        asset: {
          type: 'string',
          format: 'binary',
        },
      },
    },
    description: 'Image File',
  })
  @UseInterceptors(
    FileInterceptor('asset', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueSuffix = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueSuffix);
        },
      }),
    }),
  )
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Patch('/assets/:id')
  async updateAsset(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg|webp)' }),
        ],
      }),
    )
    asset: Express.Multer.File,
  ) {
    return await this.categoryService.updateAssets(id, asset);
  }

  @ProtectedApi({
    summary: 'Delete a category',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    description: 'Category deleted successfully',
    messageKeyExample: 'Category removed',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(id);
  }
}
