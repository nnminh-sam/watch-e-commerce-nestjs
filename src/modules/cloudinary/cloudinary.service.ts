import {
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
import { CloudinaryJob } from '@root/modules/cloudinary/jobs/cloudinary.job';
import { FileUploadDto } from '@root/modules/cloudinary/dtos/file-upload.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectQueue(QueueNameEnum.UPLOAD) private readonly uploadQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async uploadFile(file: Express.Multer.File) {
    const jobId: string = uuid();
    const jobData: CloudinaryJob = { filePath: file.path };
    try {
      const job: Job = await this.uploadQueue.add('uploadFile', jobData, {
        jobId,
      });

      this.logger.log(
        `File ${file.originalname} added to ${QueueNameEnum.UPLOAD} queue successfully`,
        CloudinaryService.name,
      );
      this.logger.log(
        `Added job ${job.id} to ${QueueNameEnum.UPLOAD} queue`,
        CloudinaryService.name,
      );

      const state = await job.getState();

      const response: FileUploadDto = {
        jobId,
        name: file.filename,
        state: state.toString(),
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
    const response: FileUploadDto = {
      jobId,
      name: job.data.originalname,
      state: state.toString(),
    };
    return response;
  }
}
