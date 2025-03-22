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
import { ApiTags, ApiOperation, ApiBadRequestResponse } from '@nestjs/swagger';
import { ApiResponseWrapper } from '@root/commons/decorators/api-response-wrapper.decorator';
import { ApiDocDetail } from '@root/commons/decorators/api-doc-detail.decorator';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { Role } from '@root/models/enums/role.enum';
import { FindProductDto } from '@root/modules/product/dto/find-product.dto';
import { Product } from '@root/models/product.model';

@ApiTags('Products')
@UseGuards(JwtGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiDocDetail({ summary: 'Create a new product' })
  @ApiResponseWrapper(Product, 'product', 'Product created successfully')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @ApiDocDetail({ summary: 'Find products by filters' })
  @ApiResponseWrapper(
    Product,
    'products',
    'List of products retrieved successfully',
  )
  @ApiOperation({ summary: 'Retrieve a list of products based on filters' })
  @Get()
  async find(@Query() findProductDto: FindProductDto) {
    return await this.productService.find(findProductDto);
  }

  @ApiDocDetail({ summary: 'Find a product by ID' })
  @ApiResponseWrapper(
    CreateProductDto,
    'product',
    'Product details retrieved successfully',
  )
  @ApiOperation({ summary: 'Retrieve a product by its ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id);
  }

  @ApiDocDetail({ summary: 'Update a product' })
  @ApiResponseWrapper(Product, 'product', 'Product updated successfully')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiBadRequestResponse()
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
