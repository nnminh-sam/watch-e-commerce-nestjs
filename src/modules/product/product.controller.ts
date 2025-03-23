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

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @SuccessApiResponse({
    model: Product,
    key: 'product',
    description: 'Product created successfully',
  })
  @ClientErrorApiResponse({
    status: 400,
    description: 'Invalid input data or missing required fields.',
  })
  // TODO: still has error in role authentication
  @UseGuards(JwtGuard)
  // @UseGuards(RoleGuard)
  // @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Find products by filters' })
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

  @ApiOperation({ summary: 'Update a product' })
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
  @UseGuards(JwtGuard)
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);
  }
}
