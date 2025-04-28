import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { EnvironmentModule } from '@root/environment/environment.module';
import { CloudinaryController } from '@root/modules/cloudinary/cloudinary.controller';

@Module({
  imports: [EnvironmentModule],
  providers: [CloudinaryService],
  controllers: [CloudinaryController],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
