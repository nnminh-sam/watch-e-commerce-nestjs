import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
import { IsMongoId } from 'class-validator';
import { MongoIdValidationPipe } from '@root/commons/pipes/mongo-id-validation.pipe';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';
import { Spec } from '@root/models/spec.model';

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
    model: Spec,
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
  async find(@Body() findProductDto: FindProductDto) {
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
}
