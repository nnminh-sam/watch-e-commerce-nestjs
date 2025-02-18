import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModuleRegistration } from '@root/brand/entities/brand.model';

@Module({
  imports: [BrandModuleRegistration],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
