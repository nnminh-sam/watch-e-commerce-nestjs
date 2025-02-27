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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductDto } from '@root/product/dto/find-product.dto';
import { JwtGuard } from '@root/auth/guard/jwt.guard';
import { RoleGuard } from '@root/user/guard/role.guard';
import { HasRoles } from '@root/user/decorator/has-role.decorator';
import { Role } from '@root/user/entities/role.enum';

@UseGuards(JwtGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(RoleGuard)
  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Get()
  async find(@Query() findProductDto: FindProductDto) {
    return await this.productService.find(findProductDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id);
  }

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
