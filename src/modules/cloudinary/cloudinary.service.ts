import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueNameEnum } from '@root/message-queue';
import { CloudinaryJob } from '@root/modules/cloudinary/interfaces/cloudinary-job.interface';

import { v4 as uuid } from 'uuid';
import { FileUploadResponseDto } from '@root/modules/cloudinary/dtos/file-upload-response.dto';
import { ResourceTypeEnum } from '@root/modules/cloudinary/enums/resource-type.enum';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectQueue(QueueNameEnum.UPLOAD) private readonly uploadQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    resourceType: ResourceTypeEnum,
    objectId: string,
  ) {
    const jobId: string = uuid();
    const jobData: CloudinaryJob = {
      filePath: file.path,
      resourceType,
      objectId,
    };
    try {
      const job: Job = await this.uploadQueue.add('uploadFile', jobData, {
        jobId,
      });

      this.logger.log(
        `Job [${job.id}]: Processing file ${file.originalname} in ${QueueNameEnum.UPLOAD} queue`,
        CloudinaryService.name,
      );

      const state = await job.getState();

      const response: FileUploadResponseDto = {
        trackingId: jobId,
        state: state.toString(),
        message: `File ${file.filename} is waiting for upload. Tracking upload process using the tracking ID`,
      };
      return response;
    } catch (error: any) {
      this.logger.error(
        `Failed to add file ${file.originalname} to ${QueueNameEnum.UPLOAD} queue: ${error.message}`,
        CloudinaryService.name,
      );
      throw new InternalServerErrorException('Cannot create cloudinary job');
    }
  }

  async findJobStatus(jobId: string) {
    const job: Job = await this.uploadQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const state = await job.getState();
    const response: FileUploadResponseDto = {
      trackingId: jobId,
      state: state.toString(),
      message: 'Upload process found',
    };
    return response;
  }
}
