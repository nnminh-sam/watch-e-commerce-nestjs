import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueNameEnum } from '@root/message-queue';
import { CloudinaryJob } from '@root/modules/cloudinary/jobs/cloudinary.job';
import { FileUploadDto } from '@root/modules/cloudinary/dtos/file-upload.dto';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectQueue(QueueNameEnum.UPLOAD) private readonly uploadQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async enqueueFile(file: Express.Multer.File) {
    const jobData: CloudinaryJob = { filePath: file.path };
    try {
      const job: Job = await this.uploadQueue.add('uploadFile', jobData, {});

      this.logger.log(
        `File ${file.originalname} added to ${QueueNameEnum.UPLOAD} queue successfully`,
        CloudinaryService.name,
      );
      this.logger.log(
        `Added job ${job.id} to ${QueueNameEnum.UPLOAD} queue`,
        CloudinaryService.name,
      );

      const response: FileUploadDto = {
        name: file.filename,
        uploadStatus: job.progress,
        message: 'Upload process will start soon',
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
}
