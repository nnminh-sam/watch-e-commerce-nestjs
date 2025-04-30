import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '@root/models/product.model';
import { BrandModule } from '@root/modules/brand/brand.module';
import { CategoryModule } from '@root/modules/category/category.module';
import { CloudinaryModule } from '@root/modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    BrandModule,
    CategoryModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
    CloudinaryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
