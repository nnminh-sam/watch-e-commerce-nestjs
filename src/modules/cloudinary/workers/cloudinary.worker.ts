import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CloudinaryJob } from '../jobs/cloudinary.job';
import { Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { APP_CLOUDINARY_PROVIDER } from '../index';
import { v2 as CloudinaryType } from 'cloudinary';
import { QueueNameEnum } from '@root/message-queue';

@Processor(QueueNameEnum.UPLOAD)
export class CloudinaryProcessor extends WorkerHost {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @Inject(APP_CLOUDINARY_PROVIDER)
    private readonly cloudinary: typeof CloudinaryType,
  ) {
    super();
  }

  async process(job: Job<CloudinaryJob>) {
    try {
      this.logger.log(
        `Starting upload for job ${job.id}`,
        CloudinaryProcessor.name,
      );

      const result = await this.cloudinary.uploader.upload(job.data.filePath, {
        resource_type: 'auto',
      });

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
}
