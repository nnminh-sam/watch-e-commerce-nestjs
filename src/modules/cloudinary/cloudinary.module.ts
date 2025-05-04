import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { EnvironmentModule } from '@root/environment/environment.module';
import { CloudinaryController } from '@root/modules/cloudinary/cloudinary.controller';
import { CloudinaryProvider } from './cloudinary';
import { QueueModule } from '@root/message-queue/message-queue.module';
import { CloudinaryProcessor } from './workers/cloudinary.worker';

@Module({
  imports: [EnvironmentModule, QueueModule],
  providers: [CloudinaryService, CloudinaryProvider, CloudinaryProcessor],
  controllers: [CloudinaryController],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
