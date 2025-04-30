import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CloudinaryJob } from '../interfaces/cloudinary-job.interface';
import { Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { APP_CLOUDINARY_PROVIDER } from '../index';
import { v2 as CloudinaryType } from 'cloudinary';
import { QueueNameEnum } from '@root/message-queue';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEnum } from '@root/modules/cloudinary/enums/event.enum';
import { ResourceTypeEnum } from '@root/modules/cloudinary/enums/resource-type.enum';

@Processor(QueueNameEnum.UPLOAD, { concurrency: 2 })
export class CloudinaryProcessor extends WorkerHost {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @Inject(APP_CLOUDINARY_PROVIDER)
    private readonly cloudinary: typeof CloudinaryType,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<CloudinaryJob>) {
    const { filePath, resourceType, objectId } = job.data;
    try {
      const result = await this.cloudinary.uploader.upload(filePath, {
        resource_type: 'auto',
      });

      switch (resourceType) {
        case ResourceTypeEnum.USER_AVATAR:
          this.eventEmitter.emit(EventEnum.UPLOAD_AVATAR_COMPLETED, {
            resourceType,
            objectId,
            url: result.secure_url,
            publicId: result.public_id,
          });
          break;
        case ResourceTypeEnum.BRAND_ASSET:
          this.eventEmitter.emit(EventEnum.UPLOAD_BRAND_ASSET_COMPLETED, {
            resourceType,
            objectId,
            url: result.secure_url,
            publicId: result.public_id,
          });
          break;
        case ResourceTypeEnum.CATEGORY_ASSET:
          this.eventEmitter.emit(EventEnum.UPLOAD_CATEGOTRY_ASSET_COMPLETED, {
            resourceType,
            objectId,
            url: result.secure_url,
            publicId: result.public_id,
          });
          break;
        case ResourceTypeEnum.PRODUCT_ASSET:
          this.eventEmitter.emit(EventEnum.UPLOAD_PRODUCT_ASSET_COMPLETED, {
            resourceType,
            objectId,
            url: result.secure_url,
            publicId: result.public_id,
          });
          break;
        default:
          this.logger.error('Invalid resource type', CloudinaryProcessor.name);
      }

      this.logger.log(
        `Upload completed for job ${job.id}`,
        CloudinaryProcessor.name,
      );

      return {
        publicId: result.public_id,
        url: result.secure_url,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to process job ${job.id}: ${error.message}`,
        CloudinaryProcessor.name,
      );
      throw error;
    }
  }

  @OnWorkerEvent('active')
  onAdded(job: Job<CloudinaryJob>) {
    this.logger.log(
      `Starting upload for job ${job.id}`,
      CloudinaryProcessor.name,
    );
  }
}
