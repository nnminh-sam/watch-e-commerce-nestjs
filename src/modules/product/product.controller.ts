import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { FindProductDto } from '@root/modules/product/dto/find-product.dto';
import { Product } from '@root/models/product.model';
import { ClientErrorApiResponse } from '@root/commons/decorators/client-error-api-response.decorator';
import { MongoIdValidationPipe } from '@root/commons/pipes/mongo-id-validation.pipe';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';
import { SpecOptionDto } from '@root/modules/product/dto/spec-option.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { ResourceTypeEnum } from '@root/modules/cloudinary/enums/resource-type.enum';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ProtectedApi({
    summary: 'Create a new product',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    model: Product,
    key: 'product',
    description: 'Product created successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid input data or missing required fields.',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @ApiOperation({
    summary: 'Find all product specification for building product filter',
  })
  @SuccessApiResponse({
    model: SpecOptionDto,
    key: 'specs',
    description: 'Find a list of available product specification',
    isArray: true,
  })
  @Get('specifications')
  async findProductSpecifications() {
    return await this.productService.findProductSpecifications();
  }

  @ApiOperation({ summary: 'Find products with filters' })
  @SuccessApiResponse({
    model: Product,
    key: 'products',
    description: 'List of products retrieved successfully',
    isArray: true,
  })
  @Get()
  async find(@Query() findProductDto: FindProductDto) {
    return await this.productService.find(findProductDto);
  }

  @ApiOperation({ summary: 'Find a product by ID' })
  @SuccessApiResponse({
    model: Product,
    key: 'product',
    description: 'Product details retrieved successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @Get(':id')
  async findOne(
    @Param('id', new MongoIdValidationPipe('Invalid product ID')) id: string,
  ) {
    return await this.productService.findOneById(id);
  }

  @ProtectedApi({
    summary: 'Update a product',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    model: Product,
    key: 'product',
    description: 'Product updated successfully',
  })
  @ClientErrorApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @ClientErrorApiResponse({
    status: 403,
    description: 'You do not have permission to update this product.',
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);
  }

  @Patch('/assets/:id')
  @ProtectedApi({
    summary: 'Update product assets',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    description: 'Product assets successfully updated',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multiple image files (maximum 3 files allowed)',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 3,
        },
      },
    },
  })
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueSuffix = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueSuffix);
        },
      }),
      limits: {
        files: 3,
      },
      fileFilter: (req, _, callback) => {
        const fileCount = req.files
          ? (req.files as Express.Multer.File[]).length
          : 0;
        if (fileCount > 3) {
          return callback(new Error('Maximum of 3 files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return await this.productService.updateAssets(id, images);
  }
}
