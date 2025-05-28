import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from '@root/models/brand.model';
import { CloudinaryModule } from '@root/modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Brand.name,
        schema: BrandSchema,
      },
    ]),
    CloudinaryModule,
  ],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
